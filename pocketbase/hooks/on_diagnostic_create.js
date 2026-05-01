onRecordCreateRequest((e) => {
  const body = e.requestInfo().body || {}
  const answers = body.answers || {}

  let totalFavorable = 0
  const pillarScores = {}
  let pillarCount = 0

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
  let worstScore = 9

  for (const pillar in pillarScores) {
    if (pillarScores[pillar] < worstScore) {
      worstScore = pillarScores[pillar]
      worstPillar = pillar
    }
  }

  let status = ''
  if (worstScore <= 2) {
    status = 'Inhaca Mental Severa'
  } else if (worstScore <= 5) {
    status = 'Fase de Transição'
  } else {
    status = 'Vida Equilibrada'
  }

  let actionPlan = ''
  if (status === 'Inhaca Mental Severa') actionPlan = 'Foco total em fechar o parêntese.'
  else if (status === 'Fase de Transição') actionPlan = 'Criar plano de ação (Colchetes).'
  else actionPlan = 'Manutenção e vigilância (Chaves).'

  let aiFeedback = `Análise do seu diagnóstico concluída. Baseado nas suas respostas, seu status atual é: **${status}**.\n\n`
  aiFeedback += `Ação recomendada geral: **${actionPlan}**\n\n`

  if (pillarCount === 1) {
    const singlePillar = Object.keys(pillarScores)[0]
    const singleScore = pillarScores[singlePillar]

    if (singleScore <= 5) {
      aiFeedback += `Avaliando o pilar **${singlePillar}**, você está com apenas ${singleScore}/8 pontos positivos.\n\n`
      aiFeedback += `**Micro-ações recomendadas para ${singlePillar}:**\n`
      aiFeedback += `- Identifique uma pequena atitude diária que possa melhorar este pilar.\n`
      aiFeedback += `- Reserve 15 minutos do seu dia para refletir sobre as barreiras que estão impedindo o seu avanço.\n`
      aiFeedback += `- Converse com alguém de confiança sobre suas dificuldades nesta área.`
    } else {
      aiFeedback += `O pilar **${singlePillar}** apresenta uma pontuação satisfatória, com ${singleScore}/8 pontos positivos. Continue com a manutenção e vigilância constante.`
    }
  } else {
    if (worstScore <= 5) {
      aiFeedback += `O pilar que merece mais atenção no momento é **${worstPillar}** com ${worstScore}/8 de favoráveis.\n\n`
      aiFeedback += `**Micro-ações recomendadas para ${worstPillar}:**\n`
      aiFeedback += `- Identifique uma pequena atitude diária que possa melhorar este pilar.\n`
      aiFeedback += `- Reserve 15 minutos do seu dia para refletir sobre as barreiras que estão impedindo o seu avanço.\n`
      aiFeedback += `- Converse com alguém de confiança sobre suas dificuldades nesta área.`
    } else {
      aiFeedback += `Todos os pilares analisados apresentam uma pontuação satisfatória. Continue com a manutenção e vigilância constante das suas áreas da vida.`
    }
  }

  e.record.set('score', score)
  e.record.set('status', status)
  e.record.set('ai_feedback', aiFeedback)

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
    const deadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    actionRecord.set('deadline', deadline.toISOString())

    $app.save(actionRecord)
  } catch (err) {
    $app.logger().error('Failed to create microaction from diagnostic', 'error', err.message)
  }

  e.next()
}, 'diagnostics')
