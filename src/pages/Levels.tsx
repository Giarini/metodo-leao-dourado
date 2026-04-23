import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock, Unlock, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export default function Levels() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userLevel = user?.unlocked_level || 1

  const levels = [
    { id: 1, name: 'Aluno', description: 'Fundamentos e Inhaca Mental', locked: userLevel < 1 },
    { id: 2, name: 'Guardião', description: 'Proteção e Disciplina', locked: userLevel < 2 },
    { id: 3, name: 'Instrutor', description: 'Transmissão do Conhecimento', locked: userLevel < 3 },
    { id: 4, name: 'Mestre', description: 'Domínio Metacognitivo', locked: userLevel < 4 },
    { id: 5, name: 'Soberano', description: 'Excelência Absoluta', locked: userLevel < 5 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-[#D4AF37] mb-2 tracking-wide">
          Sua Jornada
        </h1>
        <p className="text-slate-400 text-lg">
          Selecione o nível atual para acessar seu painel de acompanhamento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {levels.map((level) => (
          <Card
            key={level.id}
            onClick={() => !level.locked && navigate(`/nivel/${level.id}`)}
            className={cn(
              'relative overflow-hidden transition-all duration-300 border-[#D4AF37]/20',
              level.locked
                ? 'bg-black/20 opacity-60 cursor-not-allowed grayscale'
                : 'bg-black/60 backdrop-blur-xl cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:-translate-y-1',
            )}
          >
            <CardHeader className="pt-8 pb-10 flex flex-col items-center text-center gap-4">
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center border-2',
                  level.locked ? 'border-slate-600' : 'border-[#D4AF37] bg-[#D4AF37]/10',
                )}
              >
                {level.locked ? (
                  <Lock className="w-8 h-8 text-slate-500" />
                ) : (
                  <Unlock className="w-8 h-8 text-[#D4AF37]" />
                )}
              </div>
              <div>
                <CardTitle className="font-serif text-2xl text-white mb-2">
                  Nível {level.id}: {level.name}
                </CardTitle>
                <CardDescription className="text-slate-400">{level.description}</CardDescription>
              </div>
            </CardHeader>
            {!level.locked && (
              <div className="absolute top-0 right-0 p-4">
                <Crown className="w-6 h-6 text-[#D4AF37]/50" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
