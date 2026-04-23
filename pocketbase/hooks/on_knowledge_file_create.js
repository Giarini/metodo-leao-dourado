// @deps pdf-parse@1.1.1, buffer@6.0.3
onRecordAfterCreateSuccess((e) => {
  const pdfParse = require('pdf-parse')
  const { Buffer } = require('buffer')

  const instanceUrl = $secrets.get('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
  const fileUrl =
    instanceUrl +
    '/api/files/' +
    e.record.collectionId +
    '/' +
    e.record.id +
    '/' +
    e.record.getString('file')

  const res = $http.send({ url: fileUrl, method: 'GET', timeout: 60 })

  if (res.statusCode !== 200) {
    $app.logger().error('Failed to fetch PDF for parsing', 'status', res.statusCode, 'url', fileUrl)
    return e.next()
  }

  try {
    const buf = Buffer.from(res.body)

    pdfParse(buf)
      .then((data) => {
        const text = data.text
        if (!text) return

        const cleanText = text.replace(/\n+/g, '\n').trim()
        const chunkSize = 3000

        for (let i = 0; i < cleanText.length; i += chunkSize) {
          const chunk = cleanText.substring(i, i + chunkSize)
          if (chunk.trim().length < 50) continue

          try {
            const kbCol = $app.findCollectionByNameOrId('knowledge_base')
            const kbRecord = new Record(kbCol)
            kbRecord.set('content', chunk)
            kbRecord.set(
              'source',
              e.record.getString('name') + ' (Parte ' + Math.floor(i / chunkSize + 1) + ')',
            )
            $app.save(kbRecord)
          } catch (err) {
            $app.logger().error('Error saving knowledge base chunk', 'error', String(err))
          }
        }
      })
      .catch((err) => {
        $app.logger().error('pdfParse error', 'error', String(err))
      })
  } catch (err) {
    $app.logger().error('PDF processing error', 'error', String(err))
  }

  return e.next()
}, 'knowledge_files')
