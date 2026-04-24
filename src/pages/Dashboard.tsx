import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BookOpen, CalendarCheck, Sparkles, AlertTriangle } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import imgMentor from '../assets/fementoria-b538d.png'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold text-[#D4AF37] mb-2 tracking-wide">
          Painel Nível 1 – Aluno
        </h1>
        <p className="text-slate-400 text-lg">
          Bem-vindo à sua central de controle de microações e metacognição.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          onClick={() => navigate('/diario-dourado')}
          className="cursor-pointer bg-gradient-to-br from-[#D4AF37]/20 to-black/80 backdrop-blur-xl border-[#D4AF37]/50 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-300 group"
        >
          <CardHeader className="flex flex-row items-center gap-6 p-8">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-[#D4AF37]" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl text-[#D4AF37] mb-2">
                Diário Leão Dourado
              </CardTitle>
              <CardDescription className="text-slate-300 text-base">
                Registre sua evolução, decisões e vitórias.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card
          onClick={() => navigate('/diario-cobre')}
          className="cursor-pointer bg-gradient-to-br from-[#B87333]/20 to-black/80 backdrop-blur-xl border-[#B87333]/50 hover:border-[#B87333] hover:shadow-[0_0_30px_rgba(184,115,51,0.2)] transition-all duration-300 group"
        >
          <CardHeader className="flex flex-row items-center gap-6 p-8">
            <div className="w-16 h-16 rounded-full bg-[#B87333]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-8 h-8 text-[#B87333]" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl text-[#B87333] mb-2">
                Diário Leão Cobre
              </CardTitle>
              <CardDescription className="text-slate-300 text-base">
                Mapeie falhas, inhacas mentais e ajustes de rota.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card
          onClick={() => navigate('/agenda')}
          className="cursor-pointer bg-black/60 backdrop-blur-xl border-white/20 hover:border-white/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 group"
        >
          <CardHeader className="flex flex-row items-center gap-6 p-8">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="font-serif text-2xl text-white mb-2">
                Agenda de Decisões
              </CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Gerencie microações e prazos importantes.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card
          onClick={() => navigate('/mentor')}
          className="cursor-pointer bg-black/60 backdrop-blur-xl border-[#D4AF37]/30 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300 group"
        >
          <CardHeader className="flex flex-row items-center gap-6 p-8">
            <Avatar className="w-16 h-16 border-2 border-[#D4AF37] group-hover:scale-110 transition-transform">
              <AvatarImage src={imgMentor} className="object-cover" />
              <AvatarFallback className="bg-[#D4AF37] text-black font-bold">FF</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="font-serif text-2xl text-[#D4AF37] mb-2">Mentor IA</CardTitle>
              <CardDescription className="text-slate-300 text-base">
                Acesse conselhos personalizados baseados no método.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
