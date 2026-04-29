import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import pb from '@/lib/pocketbase/client'
import lionImg from '@/assets/exemplo-app-8ce35.png'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [token, setToken] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      setToken(urlToken)
    }
  }, [searchParams])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast({
        title: 'Erro de Validação',
        description: 'A nova senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (password !== passwordConfirm) {
      toast({
        title: 'Erro de Validação',
        description: 'As senhas não coincidem.',
        variant: 'destructive',
      })
      return
    }

    if (!token) {
      toast({
        title: 'Link Inválido',
        description:
          'Token de recuperação ausente ou inválido. Acesse através do link enviado para seu e-mail.',
        variant: 'destructive',
      })
      return
    }

    setFieldErrors({})
    setIsLoading(true)
    try {
      await pb.collection('users').confirmPasswordReset(token, password, passwordConfirm)
      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso! Você já pode fazer login.',
      })
      navigate('/')
    } catch (error) {
      const extracted = extractFieldErrors(error)
      if (Object.keys(extracted).length > 0) {
        setFieldErrors(extracted)
      } else {
        toast({
          title: 'Erro ao redefinir senha',
          description: 'O link de recuperação é inválido ou expirou. Solicite um novo link.',
          variant: 'destructive',
        })
      }
    } finally {
      setIsLoading(false)
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
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Crie uma nova senha para sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-slate-300">
                Nova Senha
              </Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">
                Confirmar Nova Senha
              </Label>
              <Input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 text-white"
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
              {isLoading ? 'Salvando...' : 'Redefinir Senha'}
            </Button>

            <div className="text-center text-sm mt-4">
              <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                Cancelar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
