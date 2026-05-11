export function calculateDiagnosticScore(answers: Record<string, Record<string, string>>) {
  if (!answers || Object.keys(answers).length === 0) {
    console.warn('calculateDiagnosticScore received empty answers object')
    return { score: 0, breakdown: {}, answeredPillars: 0 }
  }

  const normalize = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
  }

  const breakdown: Record<string, number> = {}
  let totalScore = 0
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

    const pillarScore = Math.round((countFavorable / 8) * 100)
    breakdown[pillar] = pillarScore
    totalScore += pillarScore
    pillarCount++
  }

  const score = pillarCount > 0 ? Math.round(totalScore / pillarCount) : 0

  const result = {
    score,
    breakdown,
    answeredPillars: pillarCount,
  }

  console.log('Computed diagnostic score:', result)
  return result
}
