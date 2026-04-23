import { useState, useMemo } from 'react'
import { format, differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'

export default function DiarioDourado() {
  const { entries, addEntry } = useAppStore()
  const { toast } = useToast()
  const [content, setContent] = useState('')

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const dourados = entries.filter((e) => e.type === 'dourado')

  const todayEntry = dourados.find((e) => e.date === todayStr)

  const lastEntry = useMemo(() => {
    if (!dourados.length) return null
    return [...dourados].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  }, [dourados])

  const missingDays = lastEntry ? differenceInDays(new Date(), new Date(lastEntry.date)) : 0
  const showMissingAlert = missingDays > 1

  const handleSave = () => {
    if (!content.trim()) return
    addEntry({
      id: Date.now().toString(),
      type: 'dourado',
      date: todayStr,
      content,
    })
    toast({
      title: 'Registro Imutável Salvo',
      description: 'Seu diário de hoje foi fechado com sucesso. Excelente evolução!',
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#D4AF37]/20 rounded-full">
          <Sparkles className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-[#D4AF37] tracking-wide">
            Diário Leão Dourado
          </h1>
          <p className="text-slate-400">Registros positivos e evolução metacognitiva.</p>
        </div>
      </div>

      {showMissingAlert && !todayEntry && (
        <Alert className="bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]">
          <Info className="w-5 h-5 text-[#D4AF37]" />
          <AlertTitle className="text-lg">Sentimos sua falta!</AlertTitle>
          <AlertDescription className="text-base text-slate-300">
            Olá, senti a sua falta aqui ontem (ou desde o dia{' '}
            {format(new Date(lastEntry!.date), 'dd/MM/yyyy')}).
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-black/40 backdrop-blur-xl border-[#D4AF37]/30">
        <CardHeader>
          <CardTitle className="text-xl text-white font-medium leading-relaxed">
            "O que aconteceu hoje de bom relativo a: tomada de decisão, coisas boas com base na sua
            transformação, nova visão, fatos positivos, que despertaram sentimentos bons e de
            evolução? Praticou alguma microação hoje? Qual?"
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntry ? (
            <div className="space-y-4">
              <div className="p-6 bg-black/60 rounded-lg border border-[#D4AF37]/20">
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {todayEntry.content}
                </p>
              </div>
              <p className="text-sm text-[#D4AF37] italic text-center">
                Registro salvo e imutável para a data de hoje.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Textarea
                placeholder="Escreva seu relato aqui..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] bg-black/50 border-[#D4AF37]/30 focus-visible:ring-[#D4AF37] text-white text-base resize-none"
              />
              <Button
                onClick={handleSave}
                disabled={!content.trim()}
                className="w-full md:w-auto px-8 bg-[#D4AF37] text-black font-bold hover:bg-[#AA8A2A] text-lg"
              >
                Salvar Relato Definitivo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
