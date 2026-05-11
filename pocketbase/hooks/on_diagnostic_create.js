onRecordCreateRequest((e) => {
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
    let numberOfPillars = 0
    const breakdown = {}

    for (const pillar in answers) {
      if (pillar.startsWith('_')) continue

      const pAnswers = answers[pillar]
      let pillarFavorable = 0

      for (const q in pAnswers) {
        if (q.startsWith('_')) continue
        const val = normalize(pAnswers[q])
        if (val === 'favoravel' || val === 'sim') {
          pillarFavorable++
        }
      }

      totalFavorable += pillarFavorable
      numberOfPillars++
      breakdown[pillar] = pillarFavorable
    }

    if (numberOfPillars === 0) {
      numberOfPillars = 1
    }

    totalQuestions = numberOfPillars * 8
    const scorePercent = Math.round((totalFavorable / totalQuestions) * 100)

    let status = ''
    let actionPhrase = ''
    let interpretation = ''

    if (scorePercent < 25) {
      status = 'Inhaca Mental Severa'
      actionPhrase = 'Foco total em fechar o parêntese'
      interpretation =
        'Essa pontuação indica possível excesso crônico de cortisol refletindo alto estresse e esgotamento mental. O foco deve ser na redução de estímulos negativos e recuperação do equilíbrio basal.'
    } else if (scorePercent < 50) {
      status = 'Equilibrio em Risco'
      actionPhrase = 'Reforçar hábitos básicos e identificar gatilhos'
      interpretation =
        'Pontos de atenção presentes neste pilar com sinais de desgaste. Recomendado fortalecer rotinas e remover atritos antes que se agrave.'
    } else if (scorePercent < 75) {
      status = 'Caminho do Despertar'
      actionPhrase = 'Consolidar avanços e remover atritos restantes'
      interpretation =
        'Bons sinais neste pilar com espaço claro para evolução. O foco deve ser refinar o que já funciona e atacar pontos específicos.'
    } else {
      status = 'Leao Dourado'
      actionPhrase = 'Manter o ritmo e elevar o padrão'
      interpretation =
        'Pilar em alta performance. Sustentar os hábitos atuais e usar este pilar como alavanca para os demais.'
    }

    const targetPillar = record.get('pillar_type') || Object.keys(breakdown)[0] || 'geral'

    const aiFeedback =
      `Análise do seu diagnóstico para o pilar ${targetPillar} concluída\n` +
      `Pontuação ${totalFavorable}/${totalQuestions} pontos positivos\n` +
      `Status Atual: ${status}\n` +
      `Ação Recomendada: ${actionPhrase}\n` +
      `${interpretation}`

    record.set('score', totalFavorable)
    record.set('status', status)
    record.set('ai_feedback', aiFeedback)
    record.set('breakdown', breakdown)

    $app
      .logger()
      .info(
        `on_diagnostic_create computed ${targetPillar} ${totalFavorable} ${totalQuestions} ${scorePercent} ${status}`,
      )
  } catch (error) {
    $app.logger().error('on_diagnostic_create error', 'msg', error.message)
  }

  e.next()
}, 'diagnostics')
