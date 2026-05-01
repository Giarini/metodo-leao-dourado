import pb from '@/lib/pocketbase/client'

export interface DiagnosticRecord {
  id: string
  user_id: string
  pillar_type: string
  answers: Record<string, Record<string, string>>
  score: number
  status: string
  ai_feedback: string
  created: string
  updated: string
}

export const createDiagnostic = (data: {
  user_id: string
  pillar_type: string
  answers: Record<string, Record<string, string>>
}) => pb.collection('diagnostics').create<DiagnosticRecord>(data)

export const getDiagnostics = () =>
  pb.collection('diagnostics').getFullList<DiagnosticRecord>({ sort: '-created' })
