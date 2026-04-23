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
  const [fileUploading, setFileUploading] = useState(false)
  const [textUploading, setTextUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)

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

  const handleAddKnowledge = async () => {
    const contentToSave = knowledgeContent.trim()
    if (!contentToSave) return

    if (!pb.authStore.isValid || user?.role !== 'admin') {
      toast({
        title: 'Não autorizado',
        description: 'Sua sessão expirou ou você não tem permissão de administrador.',
        variant: 'destructive',
      })
      return
    }

    setTextUploading(true)
    try {
      const latest = await pb.collection('knowledge_base').getList(1, 1, { sort: '-created' })
      if (latest.items.length > 0 && latest.items[0].content === contentToSave) {
        toast({
          title: 'Aviso',
          description: 'Este conteúdo é idêntico ao último adicionado.',
          variant: 'destructive',
        })
        return
      }

      await pb.collection('knowledge_base').create({
        content: contentToSave,
        source: 'Manual Input',
      })
      toast({ title: 'Conhecimento adicionado com sucesso!' })
      setKnowledgeContent('')
    } catch (e) {
      toast({
        title: 'Erro ao adicionar conhecimento',
        description: getErrorMessage(e),
        variant: 'destructive',
      })
    } finally {
      setTextUploading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!pb.authStore.isValid || user?.role !== 'admin') {
      toast({
        title: 'Não autorizado',
        description: 'Sua sessão expirou ou você não tem permissão de administrador.',
        variant: 'destructive',
      })
      return
    }

    try {
      const existing = await pb.collection('knowledge_files').getList(1, 1, {
        filter: `name = "${file.name.replace(/"/g, '\\"')}"`,
      })
      if (existing.items.length > 0) {
        toast({
          title: 'Arquivo duplicado',
          description: 'Um arquivo com este nome já foi enviado.',
          variant: 'destructive',
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
    } catch (e) {
      // ignore filter error
    }

    setFileUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      await pb.collection('knowledge_files').create(formData)

      toast({
        title: 'Arquivo enviado!',
        description: 'Iniciando processamento do documento...',
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

      const arrayBuffer = await file.arrayBuffer()
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
          description: 'Nenhum texto foi encontrado no PDF (pode ser uma imagem).',
          variant: 'destructive',
        })
      } else {
        const chunkSize = 3000
        for (let i = 0; i < cleanText.length; i += chunkSize) {
          const chunk = cleanText.substring(i, i + chunkSize)
          if (chunk.trim().length < 50) continue

          await pb.collection('knowledge_base').create({
            content: chunk,
            source: `${file.name} (Parte ${Math.floor(i / chunkSize + 1)})`,
          })
        }

        toast({
          title: 'Processamento concluído',
          description: 'O conteúdo do PDF foi adicionado à base de conhecimento.',
        })
      }
    } catch (err) {
      const msg = getErrorMessage(err)
      toast({
        title: 'Erro ao processar arquivo',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setFileUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Inserção de Texto Manual</h3>
            <Textarea
              placeholder="Insira o texto de contexto..."
              value={knowledgeContent}
              onChange={(e) => setKnowledgeContent(e.target.value)}
              className="min-h-[120px] bg-black/50 border-white/20 text-white resize-none"
            />
            <Button
              onClick={handleAddKnowledge}
              disabled={textUploading || !knowledgeContent.trim()}
              className="bg-[#D4AF37] text-black font-bold hover:bg-[#B87333]"
            >
              {textUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
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
              Upload de Documentos (PDF)
            </h3>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={fileUploading}
                className="bg-[#D4AF37] text-black font-bold hover:bg-[#B87333] min-w-[150px]"
              >
                {fileUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Enviar PDF
                  </>
                )}
              </Button>
            </div>

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
