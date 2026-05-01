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
  Layers,
  Activity,
  ChevronRight,
} from 'lucide-react'
import type { DiagnosticRecord } from '@/services/diagnostics'

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
  onStart: (pillar: string) => void
  history: DiagnosticRecord[]
  onViewResult: (record: DiagnosticRecord) => void
}

export function DiagnosticMenu({ onStart, history, onViewResult }: Props) {
  return (
    <div className="space-y-12 animate-fade-in-up">
      <div className="text-center space-y-4 mt-4">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#D4AF37] tracking-tight">
          Guia de Diagnóstico dos 7 Pilares
        </h1>
        <p className="text-slate-300 max-w-2xl mx-auto text-lg leading-relaxed">
          Escolha o pilar para efetuar o seu diagnóstico semanal ou escolha total para fazer o
          diagnóstico completo dos 7 pilares.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {Object.keys(PILLARS).map((pillar) => {
          const Icon = ICONS[pillar]
          return (
            <Button
              key={pillar}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 bg-black/40 text-white whitespace-normal text-center transition-all group"
              onClick={() => onStart(pillar)}
            >
              <Icon className="w-8 h-8 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">{pillar}</span>
            </Button>
          )
        })}
        <Button
          variant="default"
          className="h-32 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#D4AF37] to-[#B8942E] hover:from-[#E5C048] hover:to-[#C9A53F] text-black font-bold whitespace-normal text-center shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all group border-none"
          onClick={() => onStart('Todos os Pilares')}
        >
          <Layers className="w-9 h-9 group-hover:scale-110 transition-transform" />
          <span className="text-base tracking-wide">Todos os Pilares</span>
        </Button>
      </div>

      {history.length > 0 && (
        <div className="max-w-5xl mx-auto space-y-6 pt-10 border-t border-white/10">
          <h2 className="text-2xl font-serif text-[#D4AF37] flex items-center gap-2">
            <Activity className="w-6 h-6" /> Histórico de Diagnósticos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((record) => (
              <Card
                key={record.id}
                className="bg-white/5 border-white/10 hover:border-white/20 transition-colors"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-semibold text-lg">{record.pillar_type}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(record.created).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(record.created).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
                        record.status === 'Vida Equilibrada'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : record.status === 'Fase de Transição'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
                      )}
                    >
                      {record.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm text-slate-300">
                      Score Favorável: <strong className="text-white">{record.score}</strong>
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                      onClick={() => onViewResult(record)}
                    >
                      Detalhes <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
