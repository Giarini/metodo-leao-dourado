migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('knowledge_base')
    col.createRule = "@request.auth.role = 'admin'"
    col.updateRule = "@request.auth.role = 'admin'"
    col.deleteRule = "@request.auth.role = 'admin'"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('knowledge_base')
    col.createRule = null
    col.updateRule = null
    col.deleteRule = null
    app.save(col)
  },
)
