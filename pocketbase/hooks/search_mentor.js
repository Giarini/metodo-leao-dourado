routerAdd(
  'POST',
  '/backend/v1/search/mentor',
  (e) => {
    const body = e.requestInfo().body || {}
    const query = (body.query || '').trim()
    const levelContext = body.levelContext ?? 0
    if (!query) return e.badRequestError('missing query')

    const lower = query.toLowerCase()
    if (lower.includes('suporte') || lower.includes('preço') || lower.includes('pagamento')) {
      return e.json(200, {
        reply:
          'Não tenho permissão para tratar deste assunto. Por favor, envie sua dúvida ao suporte ou diretamente ao Mentor Fernando Fontes.',
      })
    }

    let embedRes
    try {
      embedRes = $http.send({
        url: 'https://api.openai.com/v1/embeddings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + $secrets.get('OPENAI_API_KEY'),
        },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: query }),
        timeout: 30,
      })

      if (embedRes.statusCode !== 200) {
        $app.logger().error('Mentor search embedding failed', 'status', embedRes.statusCode)
        return e.internalServerError(
          'Neste momento meus processos de metacognição estão passando por uma breve pausa reflexiva. Você pode tentar novamente em alguns instantes?',
        )
      }
    } catch (err) {
      $app.logger().error('Mentor search embedding transport failed', 'error', String(err))
      return e.internalServerError(
        'Neste momento meus processos de metacognição estão passando por uma breve pausa reflexiva. Você pode tentar novamente em alguns instantes?',
      )
    }

    let context = ''
    try {
      const results = $vectors.search(e, 'knowledge_base', {
        field: 'embedding',
        query: embedRes.json.data[0].embedding,
        k: 5,
      })
      context = results.items.map((r) => r.getString('content')).join('\n\n')
    } catch (err) {
      $app.logger().error('Vector search failed', 'error', String(err))
    }

    let chatRes
    try {
      chatRes = $http.send({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + $secrets.get('OPENAI_API_KEY'),
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Você é o Mentor IA Fernando Fontes, especialista no Método Leão Dourado (metacognição, inhaca mental, microações). Responda de forma sofisticada e direta usando o contexto fornecido. Se a resposta não estiver no contexto e não for sobre o método, responda inspirando à ação e disciplina, mas seja prestativo.',
            },
            {
              role: 'system',
              content:
                'Contexto de Nível do Usuário: Nível ' +
                levelContext +
                '\n\n' +
                'Contexto da Base de Conhecimento:\n' +
                (context || 'Nenhum contexto específico encontrado.'),
            },
            { role: 'user', content: query },
          ],
        }),
        timeout: 60,
      })

      if (chatRes.statusCode !== 200) {
        $app.logger().error('Mentor chat completion failed', 'status', chatRes.statusCode)
        return e.internalServerError(
          'Minhas sinapses estão um pouco sobrecarregadas agora. Mantenha a disciplina e tente novamente em breve.',
        )
      }
    } catch (err) {
      $app.logger().error('Mentor chat completion transport failed', 'error', String(err))
      return e.internalServerError(
        'Minhas sinapses estão um pouco sobrecarregadas agora. Mantenha a disciplina e tente novamente em breve.',
      )
    }

    return e.json(200, { reply: chatRes.json.choices[0].message.content })
  },
  $apis.requireAuth(),
)
