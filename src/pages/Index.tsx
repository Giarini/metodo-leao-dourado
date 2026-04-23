import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Crown } from 'lucide-react'
import useAppStore from '@/stores/main'

export default function Index() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { setUser } = useAppStore()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setUser({ name: email.split('@')[0], email })
    navigate('/niveis')
  }

  return (
    <div className="flex items-center justify-center min-h-[85vh]">
      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/10">
        <CardHeader className="text-center pb-8 pt-10">
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
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 focus-visible:ring-[#D4AF37] text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-[#D4AF37]/30 focus-visible:ring-[#D4AF37] text-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B87333] text-black font-bold hover:opacity-90 transition-opacity text-lg h-12"
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
