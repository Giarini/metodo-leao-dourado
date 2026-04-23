import { useState, useEffect } from 'react'
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
import { ShieldAlert, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Admin() {
  const [students, setStudents] = useState<any[]>([])
  const [knowledgeContent, setKnowledgeContent] = useState('')
  const { toast } = useToast()

  const loadStudents = async () => {
    try {
      const records = await pb
        .collection('users')
        .getFullList({ filter: 'role = "student"', sort: 'name' })
      setStudents(records)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const updateLevel = async (id: string, level: string) => {
    try {
      await pb.collection('users').update(id, { unlocked_level: parseInt(level) })
      toast({ title: 'Nível atualizado com sucesso' })
      loadStudents()
    } catch (e) {
      toast({ title: 'Erro ao atualizar nível', variant: 'destructive' })
    }
  }

  const handleAddKnowledge = async () => {
    if (!knowledgeContent.trim()) return
    try {
      await pb.collection('knowledge_base').create({
        content: knowledgeContent,
        source: 'Admin Input',
      })
      toast({ title: 'Conhecimento adicionado' })
      setKnowledgeContent('')
    } catch (e) {
      toast({ title: 'Erro ao adicionar conhecimento', variant: 'destructive' })
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

      <Card className="bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#D4AF37]" />
            Alimentar Mentor IA
          </CardTitle>
          <CardDescription className="text-slate-400">
            Adicione textos, regras do método ou trechos do livro para treinar o Mentor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Insira o texto de contexto..."
            value={knowledgeContent}
            onChange={(e) => setKnowledgeContent(e.target.value)}
            className="min-h-[120px] bg-black/50 border-white/20 text-white resize-none"
          />
          <Button
            onClick={handleAddKnowledge}
            className="bg-[#D4AF37] text-black font-bold hover:bg-[#B87333]"
          >
            Processar Conhecimento
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Gerenciamento de Alunos</CardTitle>
          <CardDescription className="text-slate-400">
            Controle o acesso aos níveis de jornada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students.length === 0 ? (
              <p className="text-slate-500">Nenhum aluno encontrado.</p>
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
    </div>
  )
}
