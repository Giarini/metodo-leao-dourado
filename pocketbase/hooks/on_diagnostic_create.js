onRecordCreate(function (e) {
  try {
    var record = e.record
    var answers = record.get('answers') || {}

    if (typeof answers === 'string') {
      try {
        answers = JSON.parse(answers)
      } catch (err) {}
    } else {
      try {
        answers = JSON.parse(JSON.stringify(answers))
      } catch (err) {}
    }

    function normalize(str) {
      if (typeof str !== 'string') return ''
      return String(str)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
    }

    var totalFavorable = 0
    var breakdown = {}
    var processedPillars = 0

    for (var pillar in answers) {
      if (!Object.prototype.hasOwnProperty.call(answers, pillar)) continue
      if (pillar.charAt(0) === '_') continue
      if (pillar === 'marshalJSON' || pillar === 'scan') continue

      var pAnswers = answers[pillar]
      if (!pAnswers || typeof pAnswers !== 'object') continue

      var pillarFavorable = 0

      for (var q in pAnswers) {
        if (!Object.prototype.hasOwnProperty.call(pAnswers, q)) continue
        if (q.charAt(0) === '_') continue
        if (q === 'marshalJSON' || q === 'scan') continue

        var val = normalize(pAnswers[q])
        if (val === 'favoravel' || val === 'sim') {
          pillarFavorable++
        }
      }

      totalFavorable += pillarFavorable
      breakdown[pillar] = pillarFavorable
      processedPillars++
    }

    var totalQuestions = processedPillars * 8
    var scorePercent = totalQuestions > 0 ? Math.round((totalFavorable / totalQuestions) * 100) : 0

    var status = ''
    var actionPlan = ''
    var neuroExplanation = ''

    if (scorePercent < 33) {
      status = 'Inhaca Mental Severa'
      actionPlan = 'Foco total em fechar o parêntese'
      neuroExplanation =
        'Essa pontuação indica um possível excesso crônico de cortisol e baixo tônus dopaminérgico.'
    } else if (scorePercent < 66) {
      status = 'Fase de Transição'
      actionPlan = 'Criar plano de ação em colchetes'
      neuroExplanation =
        'Sua rede neural está em reorganização, iniciando o processo de neuroplasticidade.'
    } else {
      status = 'Vida Equilibrada'
      actionPlan = 'Manutenção e vigilância em chaves'
      neuroExplanation = 'Excelente tônus dopaminérgico e regulação do eixo HPA.'
    }

    var targetPillar = record.get('pillar_type')
    if (!targetPillar) {
      var keys = Object.keys(breakdown)
      targetPillar = keys.length > 0 ? keys[0] : 'geral'
    }

    var aiFeedback =
      '- Análise do seu diagnóstico para o pilar ' +
      targetPillar +
      ' concluída.\n' +
      '- Pontuação: ' +
      totalFavorable +
      '/' +
      totalQuestions +
      ' pontos positivos.\n' +
      '- Status Atual: ' +
      status +
      '\n' +
      '- Ação Recomendada: ' +
      actionPlan +
      '\n' +
      '- ' +
      neuroExplanation

    record.set('score', totalFavorable)
    record.set('status', status)
    record.set('ai_feedback', aiFeedback)
    record.set('breakdown', breakdown)

    $app
      .logger()
      .info(
        'on_diagnostic_create computed ' +
          targetPillar +
          ' ' +
          totalFavorable +
          '/' +
          totalQuestions +
          ' ' +
          scorePercent +
          '% ' +
          status,
      )
  } catch (error) {
    $app.logger().error('on_diagnostic_create error', 'msg', error.message)
  }

  e.next()
}, 'diagnostics')
