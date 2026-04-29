import { useState } from 'react'
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
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const { toast } = useToast()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!/^\d{8}$/.test(password)) {
      setErrorMsg('A senha deve conter exatamente 8 números.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMsg('A senha e a confirmação devem ser iguais.')
      return
    }

    setIsLoading(true)
    const { error } = await signUp(email, password, passwordConfirm, name)
    setIsLoading(false)

    if (error) {
      setErrorMsg(getErrorMessage(error))
    } else {
      toast({
        title: 'Conta criada com sucesso!',
        description:
          'Por favor, aguarde a liberação pela central de suporte para acessar o conteúdo.',
      })
      navigate('/welcome-pending')
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
              className="h-auto w-24 rounded-xl border border-[#D4AF37]/20 object-cover shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            />
          </div>
          <CardTitle className="font-serif text-3xl text-[#D4AF37] mb-2 tracking-wide">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Inicie sua jornada no Método Leão Dourado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-6">
            {errorMsg && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao registrar</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
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
                Senha (exatamente 8 números)
              </Label>
              <Input
                id="reg-password"
                type="password"
                inputMode="numeric"
                pattern="\d{8}"
                maxLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
                placeholder="Ex: 12345678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password-confirm" className="text-slate-300">
                Confirmar Senha
              </Label>
              <Input
                id="reg-password-confirm"
                type="password"
                inputMode="numeric"
                pattern="\d{8}"
                maxLength={8}
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value.replace(/\D/g, ''))}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
                placeholder="Confirme a senha"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B87333] text-black font-bold text-lg h-12 hover:opacity-90"
            >
              {isLoading ? 'Criando...' : 'Cadastrar'}
            </Button>

            <div className="text-center text-sm text-slate-400 mt-4">
              Já tem uma conta?{' '}
              <Link to="/" className="text-[#D4AF37] hover:underline">
                Fazer login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
