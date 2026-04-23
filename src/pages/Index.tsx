import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Crown } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export default function Index() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { signIn, signUp, user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) navigate('/niveis')
  }, [user, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)
    if (error) {
      toast({
        title: 'Erro ao entrar',
        description: 'Verifique suas credenciais.',
        variant: 'destructive',
      })
    } else {
      navigate('/niveis')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await signUp(email, password, name)
    setIsLoading(false)
    if (error) {
      toast({
        title: 'Erro ao registrar',
        description: 'Tente novamente com outros dados.',
        variant: 'destructive',
      })
    } else {
      navigate('/niveis')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#001f3f] to-[#000000] p-4">
      <Card className="w-full max-w-md bg-black/60 backdrop-blur-xl border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10">
        <CardHeader className="text-center pb-6 pt-10">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B87333] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Crown className="w-10 h-10 text-black" />
          </div>
          <CardTitle className="font-serif text-3xl text-[#D4AF37] mb-2 tracking-wide">
            Método Leão Dourado
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Sistema Interno de Acompanhamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-black/50 border border-white/10 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#D4AF37]/20">
                Acessar
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-[#D4AF37]/20">
                Criar Conta
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
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
                  <Label htmlFor="login-password" className="text-slate-300">
                    Senha
                  </Label>
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
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="reg-name" className="text-slate-300">
                    Nome Completo
                  </Label>
                  <Input
                    id="reg-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-black/50 border-[#D4AF37]/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-slate-300">
                    E-mail
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black/50 border-[#D4AF37]/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-slate-300">
                    Senha
                  </Label>
                  <Input
                    id="reg-password"
                    type="password"
                    required
                    minLength={8}
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
                  {isLoading ? 'Criando...' : 'Iniciar Jornada'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
