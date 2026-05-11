export function calculateDiagnosticScore(answers: Record<string, Record<string, string>>) {
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

    let pillarPoints = 0
    let maxPillarPoints = 0

    for (const answer of Object.values(questions)) {
      if (typeof answer !== 'string') continue

      const normAnswer = normalize(answer)

      let points = 0
      if (normAnswer === 'sim' || normAnswer.includes('sim')) {
        points = 10
      } else if (
        normAnswer.includes('as vezes') ||
        normAnswer.includes('as_vezes') ||
        normAnswer.includes('parcialmente')
      ) {
        points = 5
      } else if (normAnswer === 'nao' || normAnswer.includes('nao')) {
        points = 0
      }

      pillarPoints += points
      maxPillarPoints += 10
    }

    const pillarScore = maxPillarPoints > 0 ? Math.round((pillarPoints / maxPillarPoints) * 100) : 0
    breakdown[pillar] = pillarScore
    totalScore += pillarScore
    pillarCount++
  }

  const score = pillarCount > 0 ? Math.round(totalScore / pillarCount) : 0

  return {
    score,
    breakdown,
    timestamp: new Date().toISOString(),
  }
}
