import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { createDiagnostic, getDiagnostics, type DiagnosticRecord } from '@/services/diagnostics'
import { useToast } from '@/hooks/use-toast'
import { DiagnosticMenu } from '@/components/diagnostico/DiagnosticMenu'
import { DiagnosticQuestionnaire } from '@/components/diagnostico/DiagnosticQuestionnaire'
import { DiagnosticResults } from '@/components/diagnostico/DiagnosticResults'

export default function Diagnostico() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [mode, setMode] = useState<'menu' | 'questionnaire' | 'results'>('menu')
  const [selectedPillar, setSelectedPillar] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentResult, setCurrentResult] = useState<DiagnosticRecord | null>(null)
  const [history, setHistory] = useState<DiagnosticRecord[]>([])

  const loadHistory = async () => {
    if (!user) return
    try {
      const data = await getDiagnostics()
      setHistory(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [user])
  useRealtime('diagnostics', () => {
    loadHistory()
  })

  const handleStart = (pillar: string) => {
    setSelectedPillar(pillar)
    setMode('questionnaire')
  }

  const handleSubmit = async (answers: Record<string, Record<string, string>>) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const record = await createDiagnostic({
        user_id: user.id,
        pillar_type: selectedPillar,
        answers,
      })
      setCurrentResult(record)
      setMode('results')
      toast({ title: 'Diagnóstico concluído com sucesso!' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (mode === 'results' && currentResult) {
    return <DiagnosticResults result={currentResult} onBack={() => setMode('menu')} />
  }

  if (mode === 'questionnaire') {
    return (
      <DiagnosticQuestionnaire
        selectedPillar={selectedPillar}
        isSubmitting={isSubmitting}
        onCancel={() => setMode('menu')}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <DiagnosticMenu
      onStart={handleStart}
      history={history}
      onViewResult={(r) => {
        setCurrentResult(r)
        setMode('results')
      }}
    />
  )
}
