import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { LogOut, MessageCircle } from 'lucide-react'
import lionImg from '@/assets/exemplo-app-8ce35.png'

export default function WelcomePending() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.status === 'active' || user?.role === 'admin') {
      navigate('/niveis')
    }
  }, [user, navigate])

  const handleSupport = () => {
    window.open(
      'https://wa.me/5511999999999?text=Ol%C3%A1%2C%20me%20cadastrei%20no%20M%C3%A9todo%20Le%C3%A3o%20Dourado%20e%20gostaria%20de%20ativar%20meu%20acesso.',
      '_blank',
    )
  }

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#001f3f] to-[#000000] p-4">
      <Card className="w-full max-w-lg bg-black/60 backdrop-blur-xl border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] via-[#FDF5E6] to-[#D4AF37]" />

        <CardHeader className="pb-6 pt-10">
          <div className="mx-auto mb-6 flex w-full justify-center">
            <img
              src={lionImg}
              alt="Leão Dourado"
              className="h-auto w-32 rounded-full border-2 border-[#D4AF37]/50 object-cover shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            />
          </div>
          <CardTitle className="font-serif text-3xl text-white mb-2">
            {user?.status === 'blocked' ? (
              <span className="text-red-500">Acesso Bloqueado</span>
            ) : (
              <>
                Bem-vindo ao <span className="text-[#D4AF37]">Método Leão Dourado!</span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            {user?.status === 'blocked'
              ? 'Sua conta foi bloqueada pela administração.'
              : 'Seu acesso ainda está pendente de aprovação pela central de suporte.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-6 rounded-xl">
            <p className="text-slate-200">
              {user?.status === 'blocked'
                ? 'Por favor, entre em contato com o suporte para mais informações sobre o status da sua conta.'
                : 'Sua conta foi criada com sucesso! Por favor, aguarde a liberação pela central de suporte para acessar o conteúdo da sua jornada. Para agilizar, você pode nos contatar via WhatsApp.'}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleSupport}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg h-14 rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
            >
              <MessageCircle className="w-6 h-6" />
              Falar com Suporte no WhatsApp
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
