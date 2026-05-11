export function calculateDiagnosticScore(answers: Record<string, Record<string, string>>) {
  if (!answers || Object.keys(answers).length === 0) {
    console.warn('calculateDiagnosticScore received empty answers object')
    return {
      score: 0,
      scorePercent: 0,
      status: 'Inhaca Mental Severa',
      breakdown: {},
      totalQuestions: 0,
    }
  }

  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  const breakdown: Record<string, number> = {}
  let totalFavorable = 0
  let totalQuestions = 0

  for (const [pillar, questions] of Object.entries(answers)) {
    if (pillar.startsWith('_') || !questions || typeof questions !== 'object') continue

    let countFavorable = 0
    let countQuestions = 0

    for (const [qKey, answer] of Object.entries(questions)) {
      if (qKey.startsWith('_')) continue
      if (typeof answer !== 'string') continue

      const normAnswer = normalize(answer)
      if (normAnswer === 'favoravel' || normAnswer === 'sim') {
        countFavorable++
      }
      countQuestions++
    }

    breakdown[pillar] = countFavorable
    totalFavorable += countFavorable
    totalQuestions += countQuestions
  }

  const scorePercent = totalQuestions > 0 ? Math.round((totalFavorable / totalQuestions) * 100) : 0

  let status = 'Inhaca Mental Severa'
  if (scorePercent >= 66) {
    status = 'Vida Equilibrada'
  } else if (scorePercent >= 33) {
    status = 'Fase de Transição'
  }

  const result = {
    score: totalFavorable,
    scorePercent,
    status,
    breakdown,
    totalQuestions,
  }

  console.log('Diagnostic score computed', result)
  return result
}
