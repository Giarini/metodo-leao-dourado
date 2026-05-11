onRecordCreate((e) => {
  try {
    const record = e.record
    let answers = record.get('answers') || {}

    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers)
      } catch (err) {}
    }

    const normalize = (str) => {
      if (typeof str !== 'string') return ''
      return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    }

    let totalFavorable = 0
    let totalQuestions = 0
    const breakdown = {}

    for (const pillar in answers) {
      if (pillar.startsWith('_')) continue

      const pAnswers = answers[pillar]
      let pillarFavorable = 0
      let pillarQuestions = 0

      for (const q in pAnswers) {
        if (q.startsWith('_')) continue
        const val = normalize(pAnswers[q])
        if (val === 'favoravel' || val === 'sim') {
          pillarFavorable++
        }
        pillarQuestions++
      }

      totalFavorable += pillarFavorable
      totalQuestions += pillarQuestions
      breakdown[pillar] = pillarFavorable
    }

    const scorePercent =
      totalQuestions > 0 ? Math.round((totalFavorable / totalQuestions) * 100) : 0

    let status = ''
    let actionPlan = ''
    let neuroExplanation = ''

    if (scorePercent < 33) {
      status = 'Inhaca Mental Severa'
      actionPlan = 'Foco total em fechar o parêntese'
      neuroExplanation = 'Essa pontuação indica um possível excesso crônico de cortisol...'
    } else if (scorePercent < 66) {
      status = 'Fase de Transição'
      actionPlan = 'Criar plano de ação (Colchetes)'
      neuroExplanation = 'Sua rede neural está em reorganização...'
    } else {
      status = 'Vida Equilibrada'
      actionPlan = 'Manutenção e vigilância (Chaves)'
      neuroExplanation = 'Excelente tônus dopaminérgico...'
    }

    const targetPillar = record.get('pillar_type') || Object.keys(breakdown)[0] || 'geral'

    const aiFeedback =
      `- Análise do seu diagnóstico para o pilar ${targetPillar} concluída.\n` +
      `- Pontuação: ${totalFavorable}/${totalQuestions} pontos positivos.\n` +
      `- Status Atual: ${status}\n` +
      `- Ação Recomendada: ${actionPlan}\n` +
      `- ${neuroExplanation}`

    record.set('score', totalFavorable)
    record.set('status', status)
    record.set('ai_feedback', aiFeedback)
    record.set('breakdown', breakdown)

    $app
      .logger()
      .info(
        `on_diagnostic_create computed ${targetPillar} ${totalFavorable}/${totalQuestions} ${scorePercent}% ${status}`,
      )
  } catch (error) {
    $app.logger().error('on_diagnostic_create error', 'msg', error.message)
  }

  e.next()
}, 'diagnostics')
