import { useState, useEffect, useRef } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ShieldAlert, BookOpen, FileText, Trash2, Upload, Lock, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'

export default function Admin() {
  const [students, setStudents] = useState<any[]>([])
  const [pendingStudents, setPendingStudents] = useState<any[]>([])
  const [knowledgeContent, setKnowledgeContent] = useState('')

  const [knowledgeFiles, setKnowledgeFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)

  const splitTextIntoChunks = (text: string, maxChunkSize = 3500): string[] => {
    const chunks: string[] = []
    let currentIndex = 0

    while (currentIndex < text.length) {
      if (currentIndex + maxChunkSize >= text.length) {
        chunks.push(text.substring(currentIndex))
        break
      }

      let splitIndex = currentIndex + maxChunkSize
      const lastNewline = text.lastIndexOf('\n', splitIndex)

      if (lastNewline > currentIndex + maxChunkSize / 2) {
        splitIndex = lastNewline
      } else {
        const lastPeriod = text.lastIndexOf('.', splitIndex)
        if (lastPeriod > currentIndex + maxChunkSize / 2) {
          splitIndex = lastPeriod + 1
        } else {
          const lastSpace = text.lastIndexOf(' ', splitIndex)
          if (lastSpace > currentIndex + maxChunkSize / 2) {
            splitIndex = lastSpace
          }
        }
      }

      chunks.push(text.substring(currentIndex, splitIndex).trim())
      currentIndex = splitIndex

      while (currentIndex < text.length && /\s/.test(text[currentIndex])) {
        currentIndex++
      }
    }

    return chunks.filter((c) => c.length > 0)
  }

  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const { toast } = useToast()

  const loadData = async () => {
    try {
      const activeRecords = await pb
        .collection('users')
        .getFullList({ filter: 'role = "student" && status = "active"', sort: 'name' })
      setStudents(activeRecords)

      const pendingRecords = await pb
        .collection('users')
        .getFullList({ filter: 'role = "student" && status = "pending"', sort: '-created' })
      setPendingStudents(pendingRecords)
    } catch {
      /* intentionally ignored */
    }
  }

  const loadFiles = async () => {
    try {
      const records = await pb.collection('knowledge_files').getFullList({ sort: '-created' })
      setKnowledgeFiles(records)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadData()
    loadFiles()
  }, [])

  const updateLevel = async (id: string, level: string) => {
    try {
      await pb.collection('users').update(id, { unlocked_level: parseInt(level) })
      toast({ title: 'Nível atualizado com sucesso' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao atualizar nível', variant: 'destructive' })
    }
  }

  const authorizeAccess = async (id: string) => {
    try {
      await pb.collection('users').update(id, { status: 'active', unlocked_level: 1 })
      toast({ title: 'Acesso autorizado com sucesso!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao autorizar acesso', variant: 'destructive' })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast({
        title: 'Erro de Validação',
        description: 'Apenas arquivos PDF são permitidos.',
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'Erro de Tamanho',
        description: 'O arquivo excede o limite de 10MB.',
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedFile(file)
  }

  const handleProcessKnowledge = async () => {
    const contentToSave = knowledgeContent.trim()
    if (!contentToSave && !selectedFile) return

    if (!pb.authStore.isValid || user?.role !== 'admin') {
      toast({
        title: 'Não autorizado',
        description: 'Sua sessão expirou ou você não tem permissão de administrador.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    setProcessingStatus('Iniciando processamento...')

    try {
      let processedText = false
      let processedFile = false

      if (contentToSave) {
        const chunks = splitTextIntoChunks(contentToSave)

        if (chunks.length === 1) {
          const latest = await pb.collection('knowledge_base').getList(1, 1, { sort: '-created' })
          if (latest.items.length > 0 && latest.items[0].content === contentToSave) {
            toast({
              title: 'Aviso',
              description: 'O conteúdo de texto é idêntico ao último adicionado. Ignorando texto.',
              variant: 'destructive',
            })
          } else {
            setProcessingStatus('Salvando texto...')
            await pb.collection('knowledge_base').create({
              content: contentToSave,
              source: 'Manual Admin Input',
            })
            processedText = true
            setKnowledgeContent('')
          }
        } else {
          let hasErrors = false
          for (let i = 0; i < chunks.length; i++) {
            setProcessingStatus(`Processando texto: parte ${i + 1} de ${chunks.length}...`)
            try {
              await pb.collection('knowledge_base').create({
                content: chunks[i],
                source: `Manual Admin Input (Parte ${i + 1}/${chunks.length})`,
              })
              processedText = true
            } catch (err) {
              hasErrors = true
              toast({
                title: `Erro na parte ${i + 1}`,
                description: getErrorMessage(err),
                variant: 'destructive',
              })
            }
          }
          if (!hasErrors) {
            setKnowledgeContent('')
          }
        }
      }

      if (selectedFile) {
        const existing = await pb.collection('knowledge_files').getList(1, 1, {
          filter: `name = "${selectedFile.name.replace(/"/g, '\\"')}"`,
        })
        if (existing.items.length > 0) {
          toast({
            title: 'Arquivo duplicado',
            description: 'Um arquivo com este nome já foi enviado. Ignorando arquivo.',
            variant: 'destructive',
          })
        } else {
          const formData = new FormData()
          formData.append('file', selectedFile)
          formData.append('name', selectedFile.name)
          await pb.collection('knowledge_files').create(formData)

          toast({
            title: 'Arquivo enviado!',
            description: 'Extraindo texto do PDF...',
          })
          loadFiles()

          if (!(window as any).pdfjsLib) {
            await new Promise<void>((resolve, reject) => {
              const script = document.createElement('script')
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js'
              script.onload = () => resolve()
              script.onerror = () => reject(new Error('Falha ao carregar biblioteca de PDF'))
              document.body.appendChild(script)
            })
          }

          const pdfjsLib = (window as any).pdfjsLib
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js'

          const arrayBuffer = await selectedFile.arrayBuffer()
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

          let fullText = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(' ')
            fullText += pageText + '\n'
          }

          const cleanText = fullText.replace(/\n+/g, '\n').trim()

          if (cleanText.length === 0) {
            toast({
              title: 'Aviso',
              description: 'Nenhum texto encontrado no PDF (pode ser imagem).',
              variant: 'destructive',
            })
          } else {
            const pdfChunks = splitTextIntoChunks(cleanText, 3000)
            for (let i = 0; i < pdfChunks.length; i++) {
              const chunk = pdfChunks[i]
              if (chunk.trim().length < 50) continue

              setProcessingStatus(`Extraindo PDF: parte ${i + 1} de ${pdfChunks.length}...`)
              try {
                await pb.collection('knowledge_base').create({
                  content: chunk,
                  source: `${selectedFile.name} (Parte ${i + 1})`,
                })
              } catch (err) {
                toast({
                  title: `Erro na parte ${i + 1} do PDF`,
                  description: getErrorMessage(err),
                  variant: 'destructive',
                })
              }
            }
          }
          processedFile = true
          setSelectedFile(null)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }

      if (processedText || processedFile) {
        toast({ title: 'Conhecimento processado com sucesso!' })
      }
    } catch (err) {
      toast({
        title: 'Erro ao processar conhecimento',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
      setProcessingStatus(null)
    }
  }

  const confirmDeleteFile = (id: string) => {
    setFileToDelete(id)
  }

  const executeDeleteFile = async () => {
    if (!fileToDelete) return
    try {
      const fileRecord = await pb.collection('knowledge_files').getOne(fileToDelete)
      await pb.collection('knowledge_files').delete(fileToDelete)

      const chunks = await pb.collection('knowledge_base').getFullList({
        filter: `source ~ "${fileRecord.name.replace(/"/g, '\\"')}"`,
      })
      for (const chunk of chunks) {
        await pb.collection('knowledge_base').delete(chunk.id)
      }

      toast({ title: 'Sucesso', description: 'Arquivo e conteúdo removidos com sucesso.' })
      loadFiles()
    } catch (err) {
      toast({ title: 'Erro', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setFileToDelete(null)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({ title: 'Erro', description: 'As senhas não coincidem.', variant: 'destructive' })
      return
    }
    if (newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }
    setPasswordLoading(true)
    try {
      if (user) {
        await pb.collection('users').update(user.id, {
          oldPassword: currentPassword,
          password: newPassword,
          passwordConfirm: confirmPassword,
        })
        toast({ title: 'Senha atualizada com sucesso!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      toast({
        title: 'Erro ao atualizar senha',
        description: 'Verifique a senha atual e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-red-500/20 rounded-full">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-wide">Administração</h1>
          <p className="text-slate-400">Gerencie alunos e o cérebro da IA.</p>
        </div>
      </div>

      <Card className="bg-black/40 backdrop-blur-xl border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Pendências de Acesso
          </CardTitle>
          <CardDescription className="text-slate-400">
            Alunos aguardando aprovação para iniciar a jornada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingStudents.length === 0 ? (
              <p className="text-slate-500 italic text-center py-4 bg-black/40 rounded-lg">
                Nenhum aluno pendente.
              </p>
            ) : (
              pendingStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-black/60 border border-amber-500/20 rounded-lg"
                >
                  <div>
                    <h3 className="text-lg font-medium text-white">{student.name || 'Sem nome'}</h3>
                    <p className="text-sm text-slate-400">{student.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Registrado em: {new Date(student.created).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    onClick={() => authorizeAccess(student.id)}
                    className="bg-[#D4AF37] hover:bg-[#B87333] text-black font-bold"
                  >
                    Autorizar Acesso
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            Alimentar Mentor IA
          </CardTitle>
          <CardDescription className="text-slate-400">
            Adicione textos ou envie documentos PDF para expandir a base de conhecimento do Mentor
            IA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-white text-base">Texto Manual</Label>
              <Textarea
                placeholder="Insira o texto de contexto..."
                value={knowledgeContent}
                onChange={(e) => setKnowledgeContent(e.target.value)}
                className="min-h-[120px] bg-black/50 border-white/20 text-white resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-base">Documento PDF</Label>
              <div className="flex flex-col gap-3">
                <Input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="border-white/20 bg-black/50 text-slate-300 hover:text-white hover:bg-white/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Selecionar Arquivo PDF
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-md text-sm text-[#D4AF37]">
                      <FileText className="w-4 h-4" />
                      <span className="truncate max-w-[200px] font-medium">
                        {selectedFile.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-2 text-[#D4AF37] hover:text-red-400 hover:bg-transparent"
                        onClick={() => {
                          setSelectedFile(null)
                          if (fileInputRef.current) fileInputRef.current.value = ''
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleProcessKnowledge}
              disabled={isProcessing || (!knowledgeContent.trim() && !selectedFile)}
              className="w-full bg-[#D4AF37] text-black font-bold hover:bg-[#B87333] mt-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {processingStatus || 'Processando...'}
                </>
              ) : (
                'Processar Conhecimento'
              )}
            </Button>
          </div>

          <div className="h-px bg-white/10" />

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              Arquivos PDF Processados
            </h3>

            <div className="space-y-2 mt-4">
              {knowledgeFiles.length === 0 ? (
                <p className="text-slate-500 italic text-sm bg-black/40 p-4 rounded-lg text-center border border-white/5">
                  Nenhum arquivo PDF processado ainda.
                </p>
              ) : (
                knowledgeFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-black/60 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-red-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{file.name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(file.created).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDeleteFile(file.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                      title="Remover arquivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#D4AF37]" />
            Segurança - Alterar Senha
          </CardTitle>
          <CardDescription className="text-slate-400">
            Atualize sua senha de administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label className="text-slate-300">Senha Atual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Nova Senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={passwordLoading}
              className="bg-[#D4AF37] hover:bg-[#B87333] text-black font-bold"
            >
              {passwordLoading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Alunos Ativos</CardTitle>
          <CardDescription className="text-slate-400">
            Controle o acesso aos níveis de jornada dos alunos já aprovados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.length === 0 ? (
              <p className="text-slate-500 italic text-center py-4 bg-black/40 rounded-lg">
                Nenhum aluno ativo encontrado.
              </p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 bg-black/60 border border-white/10 rounded-lg"
                >
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {student.name || student.email}
                    </h3>
                    <p className="text-sm text-slate-400">{student.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Label className="text-slate-300 whitespace-nowrap">Nível de Acesso:</Label>
                    <Select
                      defaultValue={student.unlocked_level?.toString()}
                      onValueChange={(val) => updateLevel(student.id, val)}
                    >
                      <SelectTrigger className="w-32 bg-black border-[#D4AF37]/50 text-[#D4AF37]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-[#D4AF37]/50 text-white">
                        <SelectItem value="1">1 - Aluno</SelectItem>
                        <SelectItem value="2">2 - Guardião</SelectItem>
                        <SelectItem value="3">3 - Instrutor</SelectItem>
                        <SelectItem value="4">4 - Mestre</SelectItem>
                        <SelectItem value="5">5 - Soberano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja remover este arquivo?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação não pode ser desfeita. O arquivo será removido da base de conhecimento do
              Mentor IA.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteFile}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remover Arquivo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
