migrate(
  (app) => {
    const diagnostics = app.findRecordsByFilter('diagnostics', '1=1', '', 100000, 0)

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
          if (val === 'favorável' || val === 'favoravel' || val === 'sim') {
            score++
          }
        }
      }

      let status = ''
      let actionPlan = ''
      let neuroExplanation = ''

      if (score <= 2) {
        status = 'Inhaca Mental Severa'
        actionPlan = 'Foco total em fechar o parêntese'
        neuroExplanation =
          'Essa pontuação indica um possível excesso crônico de cortisol, refletindo alto estresse e esgotamento mental. O foco deve ser na redução de estímulos negativos e recuperação do equilíbrio basal.'
      } else if (score <= 5) {
        status = 'Fase de Transição'
        actionPlan = 'Criar plano de ação (Colchetes)'
        neuroExplanation =
          'Sua rede neural está em reorganização. Há uma alternância entre picos de cortisol e momentos de estabilidade. Estabelecer rotinas previsíveis ajudará a consolidar circuitos de dopamina mais saudáveis e sustentáveis.'
      } else {
        status = 'Vida Equilibrada'
        actionPlan = 'Manutenção e vigilância (Chaves)'
        neuroExplanation =
          'Excelente tônus dopaminérgico e bom gerenciamento de estresse (cortisol sob controle). A neuroplasticidade está atuando a seu favor, mantendo a clareza mental e a motivação intrínseca.'
      }

      const targetPillar = record.get('pillar_type') || singlePillar || 'o pilar analisado'

      let aiFeedback = `Análise do seu diagnóstico para o pilar ${targetPillar} concluída.\n`
      aiFeedback += `Pontuação: ${score}/8 pontos positivos.\n`
      aiFeedback += `Status Atual: ${status}\n`
      aiFeedback += `Ação Recomendada: ${actionPlan}\n`
      aiFeedback += `${neuroExplanation}`

      record.set('score', score)
      record.set('status', status)
      record.set('ai_feedback', aiFeedback)

      app.save(record)
    }
  },
  (app) => {
    // Revert is not implemented as we are recalculating logic and overwriting string records
  },
)
