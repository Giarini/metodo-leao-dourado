onRecordAfterCreateSuccess((e) => {
  const text = e.record.getString('content')
  if (!text) return e.next()
  const res = $http.send({
    url: 'https://api.openai.com/v1/embeddings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + $secrets.get('OPENAI_API_KEY'),
    },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: text }),
    timeout: 30,
  })
  if (res.statusCode !== 200) return e.next()
  const record = $app.findRecordById('knowledge_base', e.record.id)
  record.set('embedding', res.json.data[0].embedding)
  $app.save(record)
  return e.next()
}, 'knowledge_base')
