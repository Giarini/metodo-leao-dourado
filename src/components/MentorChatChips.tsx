import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

interface Props {
  level: number
  isLoading: boolean
  onSelect: (q: string) => void
}

export function MentorChatChips({ level, isLoading, onSelect }: Props) {
  const suggestedQuestions = (() => {
    const general = ['Como funciona a Jornada?', 'Quem é o Mentor IA?']
    if (level === 1) return ['O que é o primeiro pilar?', 'Como completo o Nível 1?', ...general]
    if (level === 2) return ['Como manter a disciplina?', 'O que é inhaca mental?', ...general]
    if (level === 3)
      return ['Como transmitir conhecimento?', 'Melhores práticas de instrução?', ...general]
    if (level === 4) return ['Como dominar a metacognição?', 'Técnicas avançadas?', ...general]
    if (level >= 5)
      return ['Como alcançar excelência absoluta?', 'Manter o estado de Soberano?', ...general]
    return general
  })()

  return (
    <div className="w-full mb-3 overflow-hidden">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 pb-3 px-1">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(q)}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-all disabled:opacity-50 shrink-0 shadow-sm"
            >
              {q}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5 opacity-50" />
      </ScrollArea>
    </div>
  )
}
