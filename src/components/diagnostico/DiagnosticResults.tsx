import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { DiagnosticRecord } from '@/services/diagnostics'
import { cn } from '@/lib/utils'

interface Props {
  result: DiagnosticRecord
  history: DiagnosticRecord[]
  onBack: () => void
}

function getEvolution(history: DiagnosticRecord[], currentRecord: DiagnosticRecord) {
  const prevRecord = history.find(
    (r) => r.pillar_type === currentRecord.pillar_type && r.id !== currentRecord.id,
  )
  if (prevRecord) {
    return { prevScore: prevRecord.score, diff: currentRecord.score - prevRecord.score }
  }
  return { prevScore: null, diff: 0 }
}

export function DiagnosticResults({ result, history, onBack }: Props) {
  const evolution = getEvolution(history, result)
  const renderMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-[#D4AF37] font-semibold">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  const statusColor =
    result.status === 'Vida Equilibrada'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : result.status === 'Fase de Transição'
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <Card className="bg-black/60 border-[#D4AF37]/30 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center border-b border-white/5 pb-6">
          <CardTitle className="text-3xl text-[#D4AF37] font-serif mb-2">
            Resultado do Diagnóstico
          </CardTitle>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            <span
              className={cn(
                'inline-flex items-center justify-center px-6 py-2 rounded-full border font-bold text-lg tracking-wide',
                statusColor,
              )}
            >
              Pontuação: {result.score ?? 0} de{' '}
              {Object.keys(result.answers || {}).filter((k) => !k.startsWith('_')).length * 8}
            </span>
            <span
              className={cn(
                'inline-flex items-center justify-center px-6 py-2 rounded-full border font-bold text-lg tracking-wide',
                statusColor,
              )}
            >
              Status: {result.status || 'Calculando...'}
            </span>
            <span
              className={cn(
                'inline-flex items-center justify-center px-6 py-2 rounded-full border font-bold text-lg tracking-wide',
                statusColor,
              )}
            >
              Ação:{' '}
              {result.status === 'Inhaca Mental Severa'
                ? 'Foco total em fechar o parêntese'
                : result.status === 'Fase de Transição'
                  ? 'Criar plano de ação (Colchetes)'
                  : 'Manutenção e vigilância (Chaves)'}
            </span>
            {evolution.prevScore !== null && (
              <span
                className={cn(
                  'inline-flex items-center justify-center px-6 py-2 rounded-full border font-bold text-lg tracking-wide',
                  evolution.diff > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : evolution.diff < 0
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                )}
              >
                Evolução:
                {evolution.diff > 0 ? (
                  <TrendingUp className="w-5 h-5 ml-2 mr-1" />
                ) : evolution.diff < 0 ? (
                  <TrendingDown className="w-5 h-5 ml-2 mr-1" />
                ) : (
                  <Minus className="w-5 h-5 ml-2 mr-1" />
                )}
                {evolution.diff > 0 ? `+${evolution.diff}` : evolution.diff} pts
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="prose prose-invert max-w-none space-y-5">
            {(result.ai_feedback || '').split('\n').map((para, i) => {
              if (!para.trim()) return null
              if (para.startsWith('- ')) {
                return (
                  <div key={i} className="flex items-start gap-2 text-slate-300 ml-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-2 shrink-0" />
                    <p className="leading-relaxed text-lg mb-0">
                      {renderMarkdown(para.substring(2))}
                    </p>
                  </div>
                )
              }
              return (
                <p key={i} className="text-slate-300 leading-relaxed text-lg">
                  {renderMarkdown(para)}
                </p>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/5 pt-8 pb-4">
          <Button
            onClick={onBack}
            size="lg"
            className="bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-black font-semibold px-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Voltar ao Início
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
