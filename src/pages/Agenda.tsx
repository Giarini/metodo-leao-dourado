import { useState, useMemo } from 'react'
import { format, differenceInDays, addDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, BellRing } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useAppStore from '@/stores/main'

export default function Agenda() {
  const { tasks, addTask } = useAppStore()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [deadline, setDeadline] = useState('')

  const minDate = format(new Date(), 'yyyy-MM-dd')
  const maxDate = format(addDays(new Date(), 60), 'yyyy-MM-dd')

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !deadline) return

    addTask({
      id: Date.now().toString(),
      title,
      deadline,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    })

    setTitle('')
    setDeadline('')
    toast({ title: 'Microação Agendada', description: 'Sua tarefa foi adicionada com sucesso.' })
  }

  const sortedTasks = useMemo(() => {
    return [...tasks].sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
  }, [tasks])

  const getStatus = (deadlineStr: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(deadlineStr)
    target.setHours(0, 0, 0, 0)

    const diff = differenceInDays(target, today)

    if (diff < 0)
      return { bg: 'bg-red-500/20', text: 'text-red-500', dot: 'bg-red-500', label: 'Atrasado' }
    if (diff === 0)
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-500',
        dot: 'bg-yellow-500',
        label: 'Hoje',
      }
    if (diff <= 20)
      return {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-500',
        dot: 'bg-yellow-500',
        label: 'Atenção',
      }
    return { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500', label: 'No Prazo' }
  }

  const upcomingAlert = useMemo(() => {
    const upcoming = sortedTasks.filter((t) => {
      const diff = differenceInDays(new Date(t.deadline), new Date())
      return diff >= 0 && diff <= 35
    })
    if (!upcoming.length) return null

    const closest = upcoming[0]
    const diff = differenceInDays(new Date(closest.deadline), new Date())

    if (diff === 0) return 'Tem pendência para hoje! Decida se estiver pronto.'
    if (diff <= 20) return 'Está próximo de resolver sua pendência, você está pronto?'
    if (diff <= 35) return 'Atenção, tem agendamento de decisões se aproximando.'
    return null
  }, [sortedTasks])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-full">
          <CalendarCheck className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-wide">
            Agenda de Ações
          </h1>
          <p className="text-slate-400">Escreva microações e gerencie pendências.</p>
        </div>
      </div>

      {upcomingAlert && (
        <Alert className="bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
          <BellRing className="w-5 h-5 text-yellow-500" />
          <AlertTitle className="text-lg">Alerta de Decisão</AlertTitle>
          <AlertDescription className="text-base">{upcomingAlert}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-black/40 backdrop-blur-xl border-white/20">
        <CardHeader>
          <CardTitle className="text-xl text-white">Nova Microação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <Label className="text-slate-300">O que precisa ser feito?</Label>
              <Input
                placeholder="Ex: Ler 10 páginas..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-black/50 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2 w-full md:w-auto">
              <Label className="text-slate-300">Prazo (Máx 60 dias)</Label>
              <Input
                type="date"
                min={minDate}
                max={maxDate}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-black/50 border-white/20 text-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full md:w-auto bg-white text-black hover:bg-slate-200 h-10"
            >
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-serif text-white">Pendências</h2>
        {sortedTasks.length === 0 ? (
          <p className="text-slate-500">Nenhuma ação pendente.</p>
        ) : (
          <div className="grid gap-3">
            {sortedTasks.map((task) => {
              const status = getStatus(task.deadline)
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div>
                    <h3 className="text-lg font-medium text-white">{task.title}</h3>
                    <p className="text-sm text-slate-400">
                      Prazo: {format(new Date(task.deadline), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${status.bg} ${status.text} border-transparent`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${status.dot}`} />
                    {status.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
