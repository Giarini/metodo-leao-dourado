import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import lionImg from '@/assets/exemplo-app-8ce35.png'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { requestPasswordReset } = useAuth()
  const { toast } = useToast()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await requestPasswordReset(email)
    setIsLoading(false)

    if (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível solicitar a recuperação. Verifique o e-mail informado.',
        variant: 'destructive',
      })
    } else {
      setIsSent(true)
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
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            {isSent
              ? 'E-mail enviado com sucesso'
              : 'Informe seu e-mail para receber um link de recuperação'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="text-center space-y-6">
              <p className="text-slate-300">
                Enviamos as instruções de recuperação para <strong>{email}</strong>. Verifique sua
                caixa de entrada e também a pasta de spam.
              </p>
              <Button asChild className="w-full bg-slate-800 text-white hover:bg-slate-700">
                <Link to="/">Voltar ao Login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-slate-300">
                  E-mail
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-[#D4AF37]/30 text-white"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B87333] text-black font-bold text-lg h-12 hover:opacity-90"
              >
                {isLoading ? 'Enviando...' : 'Recuperar Senha'}
              </Button>

              <div className="text-center text-sm mt-4">
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Voltar ao login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
