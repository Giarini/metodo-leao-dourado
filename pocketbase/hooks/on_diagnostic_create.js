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

  // Calculate score based on total "Favorável" answers case-insensitively
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

  // Determine status based on the score (0-8 scale)
  let status = ''
  if (score <= 2) {
    status = 'Inhaca Mental Severa'
  } else if (score <= 5) {
    status = 'Fase de Transição'
  } else {
    status = 'Vida Equilibrada'
  }

  // General recommendation
  let actionPlan = ''
  if (status === 'Inhaca Mental Severa') actionPlan = 'Foco total em fechar o parêntese.'
  else if (status === 'Fase de Transição') actionPlan = 'Criar plano de ação (Colchetes).'
  else actionPlan = 'Manutenção e vigilância (Chaves).'

  // Build the AI Feedback dynamically
  let aiFeedback = `Análise do seu diagnóstico concluída. Baseado nas suas respostas, seu status atual é: **${status}**.\n\n`
  aiFeedback += `Ação recomendada geral: **${actionPlan}**\n\n`

  const targetPillar = e.record.get('pillar_type') || singlePillar || 'o pilar analisado'

  aiFeedback += `Avaliando o pilar **${targetPillar}**, você obteve **${score}/8 pontos positivos**.\n\n`

  if (score <= 5) {
    aiFeedback += `**Micro-ações recomendadas para ${targetPillar}:**\n`
    aiFeedback += `- Identifique uma pequena atitude diária que possa melhorar este pilar.\n`
    aiFeedback += `- Reserve 15 minutos do seu dia para refletir sobre as barreiras que estão impedindo o seu avanço.\n`
    aiFeedback += `- Converse com alguém de confiança sobre suas dificuldades nesta área.`
  } else {
    aiFeedback += `O pilar **${targetPillar}** apresenta uma pontuação satisfatória. Continue com a manutenção e vigilância constante.`
  }

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
