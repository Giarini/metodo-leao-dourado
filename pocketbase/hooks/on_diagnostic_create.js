onRecordCreateRequest((e) => {
  const body = e.requestInfo().body || {}
  let answers = body.answers || {}

  // Defensively parse if answers somehow arrive stringified
  if (typeof answers === 'string') {
    try {
      answers = JSON.parse(answers)
    } catch (err) {}
  }

  let totalFavorable = 0
  const pillarScores = {}
  let pillarCount = 0

  // Calculate score for each pillar
  for (const pillar in answers) {
    pillarCount++
    const pAnswers = answers[pillar]
    let pFav = 0
    for (const q in pAnswers) {
      if (pAnswers[q] === 'Favorável') {
        pFav++
        totalFavorable++
      }
    }
    pillarScores[pillar] = pFav
  }

  const score = totalFavorable

  let worstPillar = null
  let worstScore = 9 // Higher than possible max per pillar (8)

  // Identify the worst pillar
  for (const pillar in pillarScores) {
    if (pillarScores[pillar] < worstScore) {
      worstScore = pillarScores[pillar]
      worstPillar = pillar
    }
  }

  if (pillarCount === 0) {
    worstScore = 0
    worstPillar = 'Nenhum'
  }

  // Determine status based on the lowest pillar score (0-8 scale)
  let status = ''
  if (worstScore <= 2) {
    status = 'Inhaca Mental Severa'
  } else if (worstScore <= 5) {
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

  if (pillarCount === 1) {
    // Logic for individual pillar
    const singlePillar = Object.keys(pillarScores)[0]
    const singleScore = pillarScores[singlePillar] || 0

    aiFeedback += `Avaliando o pilar **${singlePillar}**, você obteve **${singleScore}/8 pontos positivos**.\n\n`

    if (singleScore <= 5) {
      aiFeedback += `**Micro-ações recomendadas para ${singlePillar}:**\n`
      aiFeedback += `- Identifique uma pequena atitude diária que possa melhorar este pilar.\n`
      aiFeedback += `- Reserve 15 minutos do seu dia para refletir sobre as barreiras que estão impedindo o seu avanço.\n`
      aiFeedback += `- Converse com alguém de confiança sobre suas dificuldades nesta área.`
    } else {
      aiFeedback += `O pilar **${singlePillar}** apresenta uma pontuação satisfatória. Continue com a manutenção e vigilância constante.`
    }
  } else {
    // Logic for all pillars
    if (worstScore <= 5) {
      aiFeedback += `O pilar que mais precisa de atenção no momento é **${worstPillar}** com **${worstScore}/8 pontos positivos**.\n\n`
      aiFeedback += `**Micro-ações recomendadas para ${worstPillar}:**\n`
      aiFeedback += `- Identifique uma pequena atitude diária que possa melhorar este pilar.\n`
      aiFeedback += `- Reserve 15 minutos do seu dia para refletir sobre as barreiras que estão impedindo o seu avanço.\n`
      aiFeedback += `- Converse com alguém de confiança sobre suas dificuldades nesta área.`
    } else {
      aiFeedback += `Todos os pilares analisados apresentam uma pontuação satisfatória (pior nota foi **${worstScore}/8 pontos positivos**). Continue com a manutenção e vigilância constante das suas áreas da vida.`
    }
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

    let targetPillar = pillarCount === 1 ? Object.keys(pillarScores)[0] : worstPillar
    let microActionTitle =
      worstScore <= 5
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
