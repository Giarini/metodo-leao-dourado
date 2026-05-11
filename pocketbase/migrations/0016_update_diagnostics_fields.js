migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('diagnostics')

    if (!col.fields.getByName('score')) {
      col.fields.add(new NumberField({ name: 'score' }))
    }
    if (!col.fields.getByName('breakdown')) {
      col.fields.add(new JSONField({ name: 'breakdown' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('diagnostics')

    if (col.fields.getByName('breakdown')) {
      col.fields.removeByName('breakdown')
    }

    app.save(col)
  },
)
