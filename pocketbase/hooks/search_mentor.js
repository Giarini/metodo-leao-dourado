routerAdd(
  'POST',
  '/backend/v1/search/mentor',
  (e) => {
    const body = e.requestInfo().body || {}
    const query = (body.query || '').trim()
    if (!query) return e.badRequestError('missing query')

    const lower = query.toLowerCase()
    if (lower.includes('suporte') || lower.includes('preço') || lower.includes('pagamento')) {
      return e.json(200, {
        reply:
          'Não tenho permissão para tratar deste assunto. Por favor, envie sua dúvida ao suporte ou diretamente ao Mentor Fernando Fontes.',
      })
    }

    const embedRes = $http.send({
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
      return e.json(200, {
        reply:
          'Excelente reflexão. A disciplina quebra a resistência. Qual a menor ação possível que você pode fazer agora mesmo?',
      })
    }

    let context = ''
    try {
      const results = $vectors.search(e, 'knowledge_base', {
        field: 'embedding',
        query: embedRes.json.data[0].embedding,
        k: 3,
      })
      context = results.items.map((r) => r.getString('content')).join('\n\n')
    } catch (err) {}

    const chatRes = $http.send({
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
              'Você é o Mentor IA Fernando Fontes, especialista no Método Leão Dourado (metacognição, inhaca mental, microações). Responda de forma sofisticada e direta usando o contexto. Se não souber responder algo sobre o método, responda inspirando à ação e disciplina.',
          },
          { role: 'system', content: 'Contexto:\n' + context },
          { role: 'user', content: query },
        ],
      }),
      timeout: 60,
    })

    if (chatRes.statusCode !== 200) {
      return e.json(200, {
        reply:
          'Mantenha a metacognição ativa. Transforme essa constatação em uma microação palpável para as próximas 24 horas.',
      })
    }

    return e.json(200, { reply: chatRes.json.choices[0].message.content })
  },
  $apis.requireAuth(),
)
