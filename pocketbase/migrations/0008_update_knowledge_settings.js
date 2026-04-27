migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('knowledge_base')
    if (!col.fields.getByName('is_indexed')) {
      col.fields.add(new BoolField({ name: 'is_indexed' }))
      app.save(col)

      app
        .db()
        .newQuery(`UPDATE knowledge_base SET is_indexed = 1 WHERE embedding IS NOT NULL`)
        .execute()
      app
        .db()
        .newQuery(`UPDATE knowledge_base SET is_indexed = 0 WHERE embedding IS NULL`)
        .execute()
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('knowledge_base')
    if (col.fields.getByName('is_indexed')) {
      col.fields.removeByName('is_indexed')
      app.save(col)
    }
  },
)
