migrate(
  (app) => {
    const diagnostics = app.findRecordsByFilter('diagnostics', '1=1', '', 10000, 0)

    for (const record of diagnostics) {
      let answers = record.get('answers') || {}
      if (typeof answers === 'string') {
        try {
          answers = JSON.parse(answers)
        } catch (err) {}
      }

      let score = 0
      let singlePillar = null

      for (const pillar in answers) {
        singlePillar = pillar
        const pAnswers = answers[pillar]
        for (const q in pAnswers) {
          const val = String(pAnswers[q] || '')
            .trim()
            .toLowerCase()
          if (val === 'favorável' || val === 'favoravel') {
            score++
          }
        }
      }

      let status = ''
      if (score <= 2) {
        status = 'Inhaca Mental Severa'
      } else if (score <= 5) {
        status = 'Fase de Transição'
      } else {
        status = 'Vida Equilibrada'
      }

      let actionPlan = ''
      if (status === 'Inhaca Mental Severa') actionPlan = 'Foco total em fechar o parêntese.'
      else if (status === 'Fase de Transição') actionPlan = 'Criar plano de ação (Colchetes).'
      else actionPlan = 'Manutenção e vigilância (Chaves).'

      const targetPillar = record.get('pillar_type') || singlePillar || 'o pilar analisado'

      let aiFeedback = `Análise do seu diagnóstico concluída. Baseado nas suas respostas, seu status atual é: **${status}**.\n\n`
      aiFeedback += `Ação recomendada geral: **${actionPlan}**\n\n`
      aiFeedback += `Avaliando o pilar **${targetPillar}**, você obteve **${score}/8 pontos positivos**.\n\n`

      if (score <= 5) {
        aiFeedback += `**Micro-ações recomendadas para ${targetPillar}:**\n`
        aiFeedback += `- Identifique uma pequena atitude diária que possa melhorar este pilar.\n`
        aiFeedback += `- Reserve 15 minutos do seu dia para refletir sobre as barreiras que estão impedindo o seu avanço.\n`
        aiFeedback += `- Converse com alguém de confiança sobre suas dificuldades nesta área.`
      } else {
        aiFeedback += `O pilar **${targetPillar}** apresenta uma pontuação satisfatória. Continue com a manutenção e vigilância constante.`
      }

      record.set('score', score)
      record.set('status', status)
      record.set('ai_feedback', aiFeedback)

      app.save(record)
    }
  },
  (app) => {
    // Data fixing migration. The previous invalid data cannot be accurately restored.
  },
)
