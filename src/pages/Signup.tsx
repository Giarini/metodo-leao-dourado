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
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

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

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})

    if (!name || !email || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg('Por favor, insira um e-mail válido.')
      return
    }

    if (!/^\d{8}$/.test(password)) {
      setErrorMsg('A senha deve conter exatamente 8 números (ex: 12345678).')
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
      const extracted = extractFieldErrors(error)
      if (Object.keys(extracted).length > 0) {
        setFieldErrors(extracted)
        setErrorMsg('Por favor, corrija os erros nos campos abaixo.')
      } else {
        let msg = getErrorMessage(error)
        if (msg.includes('already in use') || msg.includes('invalid or already')) {
          msg = 'Este e-mail já está cadastrado ou é inválido.'
        } else if (msg.includes('cannot be blank') || msg.includes('required')) {
          msg = 'Preencha todos os campos obrigatórios.'
        }
        setErrorMsg(msg)
      }
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
                placeholder="Seu nome completo"
              />
              {fieldErrors.name && <p className="text-sm text-red-500">{fieldErrors.name}</p>}
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
                placeholder="seu@email.com"
              />
              {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-slate-300">
                Senha{' '}
                <span className="text-slate-400 text-xs font-normal ml-1">
                  (senha 8 números ex: 12345678)
                </span>
              </Label>
              <Input
                id="reg-password"
                type="password"
                required
                minLength={8}
                maxLength={8}
                pattern="\d{8}"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
                placeholder="Digite os 8 números"
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password-confirm" className="text-slate-300">
                Confirmar Senha
              </Label>
              <Input
                id="reg-password-confirm"
                type="password"
                required
                minLength={8}
                maxLength={8}
                pattern="\d{8}"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
                placeholder="Repita os 8 números"
              />
              {fieldErrors.passwordConfirm && (
                <p className="text-sm text-red-500">{fieldErrors.passwordConfirm}</p>
              )}
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
