onRecordAfterUpdateSuccess((e) => {
  const text = e.record.getString('content')
  const oldText = e.record.original().getString('content')

  if (!text || (text === oldText && e.record.getBool('is_indexed'))) return e.next()

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

  const record = $app.findRecordById('knowledge_base', e.record.id)

  if (res.statusCode !== 200) {
    $app
      .logger()
      .error('Embedding update failed', 'recordId', e.record.id, 'status', res.statusCode)
    record.set('is_indexed', false)
    $app.saveNoValidate(record)
    return e.next()
  }

  record.set('embedding', res.json.data[0].embedding)
  record.set('is_indexed', true)
  $app.saveNoValidate(record)
  return e.next()
}, 'knowledge_base')
