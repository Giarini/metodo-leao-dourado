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
  let pillarCount = 0

  for (const [pillar, questions] of Object.entries(answers)) {
    if (pillar.startsWith('_') || !questions || typeof questions !== 'object') continue

    let countFavorable = 0

    for (const answer of Object.values(questions)) {
      if (typeof answer !== 'string') continue

      const normAnswer = normalize(answer)
      if (normAnswer === 'favoravel') {
        countFavorable++
      }
    }

    breakdown[pillar] = countFavorable
    totalFavorable += countFavorable
    pillarCount++
  }

  const totalQuestions = pillarCount * 8
  const scorePercent = totalQuestions > 0 ? Math.round((totalFavorable / totalQuestions) * 100) : 0

  let status = 'Inhaca Mental Severa'
  if (scorePercent >= 75) {
    status = 'Leão Dourado'
  } else if (scorePercent >= 50) {
    status = 'Caminho do Despertar'
  } else if (scorePercent >= 25) {
    status = 'Equilíbrio em Risco'
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
