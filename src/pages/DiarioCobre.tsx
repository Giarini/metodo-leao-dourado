import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getDiaries, createDiary } from '@/services/diaries'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'

export default function DiarioCobre() {
  const [entries, setEntries] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const navigate = useNavigate()

  const loadData = async () => {
    try {
      const records = await getDiaries()
      setEntries(records.filter((r) => r.type === 'cobre'))
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('diaries', loadData)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayEntry = entries.find((e) => e.date.startsWith(todayStr))

  const handleSave = async () => {
    if (!content.trim()) return
    setIsLoading(true)
    try {
      await createDiary({
        user: user.id,
        type: 'cobre',
        date: new Date().toISOString(),
        content,
      })
      toast({
        title: 'Falha Registrada',
        description: 'O mapeamento da sua inhaca mental foi salvo.',
      })
      setContent('')
      setShowPrompt(true)
    } catch (e) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#B87333]/20 rounded-full">
          <AlertTriangle className="w-8 h-8 text-[#B87333]" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#B87333] tracking-wide">
            Diário Leão Cobre
          </h1>
          <p className="text-slate-400">Mapeamento de inhacas mentais e ajustes.</p>
        </div>
      </div>

      <Card className="bg-black/40 backdrop-blur-xl border-[#B87333]/30">
        <CardHeader>
          <CardTitle className="text-xl text-white font-medium leading-relaxed">
            "O que aconteceu hoje que te deixou triste, aumentou a inhaca mental, não conseguiu
            segurar, achou que fez de errado, procrastinou ou falou o que não devia?"
          </CardTitle>
          <p className="text-sm text-slate-400 italic mt-2">
            (Nota: Se este erro gerou um ensinamento que te deixou feliz, anote também no Diário
            Dourado)
          </p>
        </CardHeader>
        <CardContent>
          {todayEntry ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-[#B87333] font-semibold">Sua Reflexão:</h3>
                <div className="p-4 bg-black/60 rounded-lg border border-[#B87333]/20 text-slate-300 whitespace-pre-wrap">
                  {todayEntry.content}
                </div>
              </div>
              <p className="text-sm text-[#B87333] italic text-center">
                Registro salvo e imutável para a data de hoje.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Textarea
                placeholder="Escreva seu relato aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[160px] bg-black/50 border-[#B87333]/30 focus-visible:ring-[#B87333] text-white text-base resize-none"
              />

              <Button
                onClick={handleSave}
                disabled={!content.trim() || isLoading}
                className="w-full md:w-auto px-8 bg-[#B87333] text-white font-bold hover:bg-[#965A28] text-lg"
              >
                {isLoading ? 'Salvando...' : 'Salvar Reflexão'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
        <AlertDialogContent className="bg-black/90 border-[#B87333] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-serif text-[#B87333]">
              Ação Imediata
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-base">
              Já sabe qual a microação deverá fazer em 24 horas para corrigir isso?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => navigate('/agenda')}
              className="bg-[#B87333] text-white hover:bg-[#965A28]"
            >
              Definir Microação na Agenda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
