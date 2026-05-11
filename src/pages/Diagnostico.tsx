import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { createDiagnostic, getDiagnostics, type DiagnosticRecord } from '@/services/diagnostics'
import { getActions, updateAction, type ActionRecord } from '@/services/actions'
import { useToast } from '@/hooks/use-toast'
import { DiagnosticMenu } from '@/components/diagnostico/DiagnosticMenu'
import { DiagnosticQuestionnaire } from '@/components/diagnostico/DiagnosticQuestionnaire'
import { DiagnosticResults } from '@/components/diagnostico/DiagnosticResults'
import { calculateDiagnosticScore } from '@/lib/diagnosticScoring'

export default function Diagnostico() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [mode, setMode] = useState<'menu' | 'questionnaire' | 'results'>('menu')
  const [selectedPillar, setSelectedPillar] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentResult, setCurrentResult] = useState<DiagnosticRecord | null>(null)
  const [history, setHistory] = useState<DiagnosticRecord[]>([])
  const [actions, setActions] = useState<ActionRecord[]>([])

  const loadData = async () => {
    if (!user) return
    try {
      const [diagData, actionsData] = await Promise.all([getDiagnostics(), getActions()])
      setHistory(diagData)
      setActions(actionsData)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])
  useRealtime('diagnostics', () => {
    loadData()
  })
  useRealtime('actions', () => {
    loadData()
  })

  const handleStart = (pillar: string) => {
    setSelectedPillar(pillar)
    setMode('questionnaire')
  }

  const handleSubmit = async (answers: Record<string, Record<string, string>>) => {
    if (!user) return
    setIsSubmitting(true)
    try {
      const { score, breakdown } = calculateDiagnosticScore(answers)
      console.log('Diagnostic result:', { score, breakdown })

      const record = await createDiagnostic({
        user_id: user.id,
        pillar_type: selectedPillar,
        answers,
        score,
        breakdown,
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

  const handleCompleteAction = async (id: string) => {
    try {
      await updateAction(id, { status: 'completed' })
      toast({ title: 'Micro-ação concluída! Parabéns!' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message })
    }
  }

  if (mode === 'results' && currentResult) {
    return (
      <DiagnosticResults result={currentResult} history={history} onBack={() => setMode('menu')} />
    )
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
      actions={actions}
      onCompleteAction={handleCompleteAction}
      onViewResult={(r) => {
        setCurrentResult(r)
        setMode('results')
      }}
    />
  )
}
