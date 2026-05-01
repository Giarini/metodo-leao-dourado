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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShieldAlert,
  BookOpen,
  FileText,
  Trash2,
  Upload,
  Lock,
  Loader2,
  Users,
  Plus,
  Edit2,
  Ban,
  CheckCircle,
  Search,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
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
import { useNavigate } from 'react-router-dom'
import { useRealtime } from '@/hooks/use-realtime'

export default function Admin() {
  const [usersList, setUsersList] = useState<any[]>([])
  const [knowledgeContent, setKnowledgeContent] = useState('')

  const [knowledgeFiles, setKnowledgeFiles] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [knowledgeStats, setKnowledgeStats] = useState({ total: 0, indexed: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    password: '',
    role: 'student',
    status: 'active',
    unlocked_level: 1,
  })

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
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/niveis')
    }
  }, [user, navigate])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  const { toast } = useToast()

  const loadData = async () => {
    try {
      const records = await pb.collection('users').getFullList({ sort: '-created' })
      setUsersList(records)
    } catch {
      /* intentionally ignored */
    }
  }

  useRealtime('users', () => {
    loadData()
  })

  const loadFiles = async () => {
    try {
      const records = await pb.collection('knowledge_files').getFullList({ sort: '-created' })
      setKnowledgeFiles(records)
    } catch {
      /* ignore */
    }
  }

  const loadKnowledgeStats = async () => {
    try {
      const totalRes = await pb.collection('knowledge_base').getList(1, 1)
      const indexedRes = await pb
        .collection('knowledge_base')
        .getList(1, 1, { filter: 'is_indexed = true' })
      setKnowledgeStats({ total: totalRes.totalItems, indexed: indexedRes.totalItems })
    } catch (e) {
      /* ignore */
    }
  }

  useEffect(() => {
    loadData()
    loadFiles()
    loadKnowledgeStats()
  }, [])

  const updateUser = async (id: string, data: any) => {
    try {
      await pb.collection('users').update(id, data)
      toast({ title: 'Usuário atualizado com sucesso!' })
      loadData()
    } catch (e) {
      toast({ title: 'Erro ao atualizar', description: getErrorMessage(e), variant: 'destructive' })
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await pb.collection('users').create({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.password,
        role: formData.role,
        status: formData.status,
        unlocked_level: Number(formData.unlocked_level),
      })
      toast({ title: 'Usuário criado com sucesso!' })
      setIsCreateModalOpen(false)
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao criar', description: getErrorMessage(err), variant: 'destructive' })
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToUpdate: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        unlocked_level: Number(formData.unlocked_level),
      }
      if (formData.password) {
        dataToUpdate.password = formData.password
        dataToUpdate.passwordConfirm = formData.password
      }
      await pb.collection('users').update(formData.id, dataToUpdate)
      toast({ title: 'Usuário atualizado com sucesso!' })
      setIsEditModalOpen(false)
      loadData()
    } catch (err) {
      toast({
        title: 'Erro ao atualizar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  const executeDeleteUser = async () => {
    if (!userToDelete) return
    try {
      await pb.collection('users').delete(userToDelete)
      toast({ title: 'Usuário removido com sucesso!' })
      loadData()
    } catch (err) {
      toast({ title: 'Erro ao remover', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setUserToDelete(null)
    }
  }

  const toggleUserBlock = async (u: any) => {
    const newStatus = u.status === 'blocked' ? 'active' : 'blocked'
    await updateUser(u.id, { status: newStatus })
  }

  const filteredUsers = usersList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const openEditModal = (u: any) => {
    setFormData({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      password: '',
      role: u.role || 'student',
      status: u.status || 'pending',
      unlocked_level: u.unlocked_level || 1,
    })
    setIsEditModalOpen(true)
  }

  const openCreateModal = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      password: '',
      role: 'student',
      status: 'active',
      unlocked_level: 1,
    })
    setIsCreateModalOpen(true)
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
        loadKnowledgeStats()
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
      loadKnowledgeStats()
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

  if (user?.role !== 'admin') return null

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

      <Card className="bg-black/40 backdrop-blur-xl border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.05)] overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D4AF37]" />
              Diretório de Usuários
            </CardTitle>
            <CardDescription className="text-slate-400">
              Gerencie papéis, status e níveis de acesso de todos os usuários da plataforma.
            </CardDescription>
          </div>
          <Button
            onClick={openCreateModal}
            className="bg-[#D4AF37] hover:bg-[#B87333] text-black font-bold whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Usuário
          </Button>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 overflow-x-auto space-y-4">
          <div className="relative max-w-sm px-4 sm:px-0 mt-4 sm:mt-0">
            <Search className="absolute left-7 sm:left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/50 border-white/20 text-white"
            />
          </div>

          <div className="min-w-[900px] rounded-md border border-white/10 mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-slate-300">Nome / Email</TableHead>
                  <TableHead className="text-slate-300">Papel</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Nível</TableHead>
                  <TableHead className="text-slate-300">Criado em</TableHead>
                  <TableHead className="text-slate-300 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableCell colSpan={6} className="text-center text-slate-500 py-6">
                      Nenhum usuário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="font-medium text-white">{u.name || 'Sem nome'}</div>
                        <div className="text-sm text-slate-400">{u.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'border-white/20 uppercase text-xs',
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400',
                          )}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Aluno'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'border-white/20 uppercase text-xs',
                            u.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : u.status === 'blocked'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-amber-500/20 text-amber-400',
                          )}
                        >
                          {u.status === 'active'
                            ? 'Ativo'
                            : u.status === 'blocked'
                              ? 'Bloqueado'
                              : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-white bg-white/10 px-2 py-1 rounded text-xs font-bold">
                          Nível {u.unlocked_level || 1}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(u.created).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(u)}
                            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleUserBlock(u)}
                            className={cn(
                              'h-8 w-8',
                              u.status === 'blocked'
                                ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10',
                            )}
                            title={u.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                          >
                            {u.status === 'blocked' ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Ban className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={u.id === user?.id}
                            onClick={() => setUserToDelete(u.id)}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D4AF37]" />
                Status da Base de Conhecimento
              </h3>
              <div className="bg-black/50 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Total de Blocos</span>
                  <span className="text-white font-bold">{knowledgeStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Blocos Indexados (IA)</span>
                  <span className="text-[#D4AF37] font-bold">{knowledgeStats.indexed}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Status do Processamento</span>
                    {knowledgeStats.total > 0 && knowledgeStats.total === knowledgeStats.indexed ? (
                      <span className="text-green-400 text-sm font-medium">Sincronizado</span>
                    ) : knowledgeStats.total > 0 ? (
                      <span className="text-amber-400 text-sm font-medium animate-pulse">
                        Processando...
                      </span>
                    ) : (
                      <span className="text-slate-500 text-sm font-medium">Vazio</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

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

      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        {' '}
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
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 border-white/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja excluir este usuário?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Esta ação é permanente e removerá todos os dados vinculados a este usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription className="text-slate-400">
              Adicione um novo usuário ao sistema informando seus dados básicos.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Senha (mínimo 8 caracteres)</Label>
              <Input
                required
                type="password"
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Papel</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v: string) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/20 text-white">
                    <SelectItem value="student">Aluno</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: string) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/20 text-white">
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="border-white/20 text-slate-300 hover:text-white"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#D4AF37] text-black hover:bg-[#B87333]">
                Criar Usuário
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-zinc-950 border-white/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modifique os dados do usuário. Deixe a senha em branco para não alterá-la.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nome</Label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Nova Senha (opcional)</Label>
              <Input
                type="password"
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Deixe em branco para não alterar"
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Papel</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v: string) => setFormData({ ...formData, role: v })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/20 text-white">
                    <SelectItem value="student">Aluno</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v: string) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/20 text-white">
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Nível</Label>
                <Select
                  value={formData.unlocked_level.toString()}
                  onValueChange={(v: string) =>
                    setFormData({ ...formData, unlocked_level: Number(v) })
                  }
                >
                  <SelectTrigger className="bg-black/50 border-white/20 text-white px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-white/20 text-white">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <SelectItem key={lvl} value={lvl.toString()}>
                        {lvl}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="border-white/20 text-slate-300 hover:text-white"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#D4AF37] text-black hover:bg-[#B87333]">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
