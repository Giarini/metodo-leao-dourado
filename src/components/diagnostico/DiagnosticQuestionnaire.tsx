import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PILLARS } from '@/lib/constants'
import {
  Heart,
  Briefcase,
  Home,
  Users,
  Sparkles,
  DollarSign,
  SmilePlus,
  Check,
  X,
  Loader2,
} from 'lucide-react'

const ICONS: Record<string, any> = {
  Relacionamentos: Heart,
  'Vida Profissional': Briefcase,
  'Vida Familiar': Home,
  'Relações Sociais': Users,
  Espiritualidade: Sparkles,
  'Situação Financeira': DollarSign,
  'Saúde Física e Mental': SmilePlus,
}

interface Props {
  selectedPillar: string
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (answers: Record<string, Record<string, string>>) => void
}

export function DiagnosticQuestionnaire({
  selectedPillar,
  isSubmitting,
  onCancel,
  onSubmit,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>({})

  const handleAnswer = (pillar: string, qIdx: number, val: string) => {
    setAnswers((prev) => ({ ...prev, [pillar]: { ...(prev[pillar] || {}), [qIdx]: val } }))
  }

  const pillarsToAsk =
    selectedPillar === 'Todos os Pilares' ? Object.keys(PILLARS) : [selectedPillar]
  const totalQuestions = pillarsToAsk.length * 8
  const answeredCount = Object.values(answers).reduce(
    (acc, curr) => acc + Object.keys(curr).length,
    0,
  )

  const submit = () => {
    const formatted: Record<string, Record<string, string>> = {}
    for (const p of pillarsToAsk) {
      formatted[p] = {}
      for (let i = 0; i < 8; i++) {
        formatted[p][`q${i}`] = answers[p]?.[i] || ''
      }
    }
    onSubmit(formatted)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#D4AF37] font-serif">
          Questionário: {selectedPillar}
        </h2>
        <Button variant="ghost" onClick={onCancel} className="text-slate-400 hover:text-white">
          Cancelar
        </Button>
      </div>

      {pillarsToAsk.map((pillar) => (
        <div key={pillar} className="space-y-4 mb-8">
          {selectedPillar === 'Todos os Pilares' && (
            <h3 className="text-xl font-semibold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
              {(() => {
                const Icon = ICONS[pillar]
                return <Icon className="w-5 h-5" />
              })()}{' '}
              {pillar}
            </h3>
          )}
          <div className="space-y-3">
            {PILLARS[pillar].map((q, idx) => (
              <Card
                key={idx}
                className="bg-white/5 border-white/10 hover:border-[#D4AF37]/30 transition-colors"
              >
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-slate-200 text-sm md:text-base font-medium flex-1">
                    {idx + 1}. {q}
                  </p>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant={answers[pillar]?.[idx] === 'Favorável' ? 'default' : 'outline'}
                      className={cn(
                        'w-[140px] transition-all',
                        answers[pillar]?.[idx] === 'Favorável'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                          : 'border-slate-600 text-slate-300 hover:bg-white/10',
                      )}
                      onClick={() => handleAnswer(pillar, idx, 'Favorável')}
                    >
                      <Check className="w-4 h-4 mr-2" /> Favorável
                    </Button>
                    <Button
                      variant={answers[pillar]?.[idx] === 'Desfavorável' ? 'default' : 'outline'}
                      className={cn(
                        'w-[140px] transition-all',
                        answers[pillar]?.[idx] === 'Desfavorável'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-600'
                          : 'border-slate-600 text-slate-300 hover:bg-white/10',
                      )}
                      onClick={() => handleAnswer(pillar, idx, 'Desfavorável')}
                    >
                      <X className="w-4 h-4 mr-2" /> Desfavorável
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 sticky bottom-0 bg-black/90 p-4 backdrop-blur-md rounded-xl border z-10 shadow-2xl">
        <p className="text-sm font-medium text-slate-300">
          Respondidas: <span className="text-[#D4AF37]">{answeredCount}</span> de {totalQuestions}
        </p>
        <Button
          size="lg"
          className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black font-bold w-full md:w-auto"
          disabled={answeredCount < totalQuestions || isSubmitting}
          onClick={submit}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analisando IA...
            </>
          ) : (
            'Finalizar Diagnóstico'
          )}
        </Button>
      </div>
    </div>
  )
}
