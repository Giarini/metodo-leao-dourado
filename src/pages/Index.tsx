import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import lionImg from '@/assets/exemplo-app-8ce35.png'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { signIn, user, signOut } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      if (user.status === 'pending') {
        navigate('/welcome-pending')
      } else if (user.status === 'blocked') {
        toast({
          title: 'Acesso Bloqueado',
          description: 'Sua conta foi desativada. Entre em contato com o suporte.',
          variant: 'destructive',
        })
        signOut()
      } else {
        navigate('/niveis')
      }
    }
  }, [user, navigate, toast, signOut])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)
    if (error) {
      setErrorMsg('Verifique suas credenciais e tente novamente.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#001f3f] to-[#000000] p-4">
      <Card className="w-full max-w-md bg-black/60 backdrop-blur-xl border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10">
        <CardHeader className="text-center pb-6 pt-10">
          <div className="mx-auto mb-6 flex w-full justify-center">
            <img
              src={lionImg}
              alt="Leões Dourado e Bronze"
              className="h-auto w-full rounded-xl border border-[#D4AF37]/20 object-cover shadow-[0_0_40px_rgba(212,175,55,0.2)]"
            />
          </div>
          <CardTitle className="font-serif text-3xl text-[#D4AF37] mb-2 tracking-wide">
            Método Leão Dourado
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Sistema Interno de Acompanhamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao entrar</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password" className="text-slate-300">
                  Senha
                </Label>
                <Link to="/forgot-password" className="text-sm text-[#D4AF37] hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B87333] text-black font-bold text-lg h-12 hover:opacity-90"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center text-sm text-slate-400 mt-4">
              Primeiro acesso?{' '}
              <Link to="/signup" className="text-[#D4AF37] hover:underline font-medium">
                Criar sua conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
