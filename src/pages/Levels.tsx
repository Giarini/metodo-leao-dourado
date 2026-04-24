import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

import imgLevel1 from '../assets/1-aluno-d9090.png'
import imgLevel2 from '../assets/2-guardiao-769db.png'
import imgLevel3 from '../assets/3-instrutor-84516.png'

export default function Levels() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const userLevel = user?.unlocked_level || 1

  const levels = [
    {
      id: 1,
      name: 'Aluno',
      description: 'Fundamentos e Inhaca Mental',
      locked: userLevel < 1,
      image: imgLevel1,
    },
    {
      id: 2,
      name: 'Guardião',
      description: 'Proteção e Disciplina',
      locked: userLevel < 2,
      image: imgLevel2,
    },
    {
      id: 3,
      name: 'Instrutor',
      description: 'Transmissão do Conhecimento',
      locked: userLevel < 3,
      image: imgLevel3,
    },
    {
      id: 4,
      name: 'Mestre',
      description: 'Domínio Metacognitivo',
      locked: userLevel < 4,
      image: null,
    },
    {
      id: 5,
      name: 'Soberano',
      description: 'Excelência Absoluta',
      locked: userLevel < 5,
      image: null,
    },
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
              'group relative overflow-hidden transition-all duration-300 border-[#D4AF37]/20',
              level.locked
                ? 'bg-black/20 opacity-70 cursor-not-allowed grayscale'
                : 'bg-black/60 backdrop-blur-xl cursor-pointer hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:-translate-y-1',
            )}
          >
            {level.locked && (
              <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-lg">
                <Lock className="w-4 h-4 text-slate-300" />
              </div>
            )}

            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900/50 border-b border-white/5">
              {level.image ? (
                <img
                  src={level.image}
                  alt={level.name}
                  className={cn(
                    'w-full h-full object-cover transition-transform duration-700 ease-out',
                    !level.locked && 'group-hover:scale-105',
                  )}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
                  <span className="text-[#D4AF37]/10 font-serif text-6xl font-bold">
                    {level.id === 4 ? 'IV' : level.id === 5 ? 'V' : level.id}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            </div>

            <CardHeader className="pt-6 pb-8 flex flex-col items-center text-center gap-2 relative z-10">
              <div>
                <CardTitle className="font-serif text-2xl text-white mb-2">
                  Nível {level.id}: {level.name}
                </CardTitle>
                <CardDescription className="text-slate-400">{level.description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
