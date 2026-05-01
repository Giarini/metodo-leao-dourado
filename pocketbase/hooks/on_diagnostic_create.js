onRecordCreate((e) => {
  let answers = e.record.get('answers') || {}

  // Defensively parse if answers somehow arrive stringified
  if (typeof answers === 'string') {
    try {
      answers = JSON.parse(answers)
    } catch (err) {}
  }

  let score = 0
  let singlePillar = null

  // Calculate score based on "Sim" or "Favorável" answers case-insensitively
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

  // Determine status based on the score (0-8 scale)
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

  const targetPillar = e.record.get('pillar_type') || singlePillar || 'o pilar analisado'

  // Build the AI Feedback dynamically
  let aiFeedback = `Análise do seu diagnóstico para o pilar ${targetPillar} concluída.\n`
  aiFeedback += `Pontuação: ${score}/8 pontos positivos.\n`
  aiFeedback += `Status Atual: ${status}\n`
  aiFeedback += `Ação Recomendada: ${actionPlan}\n`
  aiFeedback += `${neuroExplanation}`

  // Persist computed values
  e.record.set('score', score)
  e.record.set('status', status)
  e.record.set('ai_feedback', aiFeedback)

  // Automatically queue a microaction for the worst/target pillar
  try {
    const actionsCol = $app.findCollectionByNameOrId('actions')
    const actionRecord = new Record(actionsCol)
    actionRecord.set('user', e.record.get('user_id'))

    let microActionTitle =
      score <= 5
        ? `Agir em uma pequena atitude diária para o pilar ${targetPillar}`
        : `Revisar e manter as boas práticas no pilar ${targetPillar}`

    actionRecord.set('title', microActionTitle)
    actionRecord.set('type', 'microaction')
    actionRecord.set('status', 'pending')

    const now = new Date()
    actionRecord.set('original_date', now.toISOString())
    // Set deadline 3 days from now
    const deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    actionRecord.set('deadline', deadline.toISOString())

    $app.save(actionRecord)
  } catch (err) {
    $app.logger().error('Failed to create microaction from diagnostic', 'error', err.message)
  }

  e.next()
}, 'diagnostics')
