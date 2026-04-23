import { useState, useMemo } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'

export default function DiarioCobre() {
  const { entries, addEntry } = useAppStore()
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [action, setAction] = useState('')

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const cobres = entries.filter((e) => e.type === 'cobre')

  const todayEntry = cobres.find((e) => e.date === todayStr)

  const lastEntry = useMemo(() => {
    if (!cobres.length) return null
    return [...cobres].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }, [cobres])

  const missingDays = lastEntry ? differenceInDays(new Date(), new Date(lastEntry.date)) : 0
  const showMissingAlert = !lastEntry || missingDays > 7

  const handleSave = () => {
    if (!content.trim() || !action.trim()) return
    addEntry({
      id: Date.now().toString(),
      type: 'cobre',
      date: todayStr,
      content,
      action,
    })
    toast({
      title: 'Ajuste de Rota Salvo',
      description: 'Falha mapeada e ação definida. Siga em frente!',
    })
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

      {showMissingAlert && !todayEntry && (
        <Alert className="bg-[#B87333]/10 border-[#B87333]/50 text-[#B87333]">
          <Info className="w-5 h-5 text-[#B87333]" />
          <AlertTitle className="text-lg">Tudo bem por aí?</AlertTitle>
          <AlertDescription className="text-base text-slate-300">
            Olá, vi que não teve anotações recentemente. Caso não tenha tido falhas, que bom! Mas se
            teve, anote agora, mesmo que pequena, e defina uma microação.
          </AlertDescription>
        </Alert>
      )}

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
              <div className="space-y-2">
                <h3 className="text-[#B87333] font-semibold">Microação em 24h:</h3>
                <div className="p-4 bg-black/60 rounded-lg border border-[#B87333]/20 text-slate-300 whitespace-pre-wrap">
                  {todayEntry.action}
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
                className="min-h-[120px] bg-black/50 border-[#B87333]/30 focus-visible:ring-[#B87333] text-white text-base resize-none"
              />

              <div className="pt-4 border-t border-[#B87333]/20 space-y-4">
                <h3 className="text-lg font-serif text-[#B87333]">
                  Já sabe qual a microação deverá fazer em 24 horas para corrigir isso?
                </h3>
                <Textarea
                  placeholder="Defina sua ação corretiva imediata..."
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="min-h-[80px] bg-black/50 border-[#B87333]/30 focus-visible:ring-[#B87333] text-white text-base resize-none"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={!content.trim() || !action.trim()}
                className="w-full md:w-auto px-8 bg-[#B87333] text-white font-bold hover:bg-[#965A28] text-lg"
              >
                Salvar e Assumir Compromisso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
