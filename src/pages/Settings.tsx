import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Settings as SettingsIcon, Lock } from 'lucide-react'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Erro',
        description: 'A nova senha e a confirmação não coincidem.',
        variant: 'destructive',
      })
      return
    }
    if (newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 8 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      if (user) {
        await pb.collection('users').update(user.id, {
          oldPassword: currentPassword,
          password: newPassword,
          passwordConfirm: confirmPassword,
        })
        toast({ title: 'Senha atualizada com sucesso!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err: any) {
      const errs = extractFieldErrors(err)
      toast({
        title: 'Erro ao atualizar senha',
        description: errs.oldPassword || errs.password || 'Verifique seus dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#D4AF37]/20 rounded-full">
          <SettingsIcon className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-wide">Configurações</h1>
          <p className="text-slate-400">Gerencie as preferências e segurança da sua conta.</p>
        </div>
      </div>

      <Card className="bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#D4AF37]" />
            Alterar Senha
          </CardTitle>
          <CardDescription className="text-slate-400">
            Atualize sua senha de acesso ao sistema. É necessário informar a senha atual.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label className="text-slate-300">Senha Atual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Nova Senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-black/50 border-white/20 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#B87333] text-black font-bold transition-all duration-300"
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
