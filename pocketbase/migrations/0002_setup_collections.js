migrate((app) => {
  const users = app.findCollectionByNameOrId('_pb_users_auth_')
  users.fields.add(
    new SelectField({ name: 'role', values: ['student', 'admin'], required: true, maxSelect: 1 }),
  )
  users.fields.add(new NumberField({ name: 'unlocked_level', min: 1, max: 5, required: true }))
  users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'"
  users.updateRule = "id = @request.auth.id || @request.auth.role = 'admin'"
  app.save(users)

  const diaries = new Collection({
    name: 'diaries',
    type: 'base',
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && user = @request.auth.id",
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: 'user',
        type: 'relation',
        required: true,
        collectionId: '_pb_users_auth_',
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: 'type', type: 'select', required: true, values: ['dourado', 'cobre'], maxSelect: 1 },
      { name: 'content', type: 'text', required: true },
      { name: 'date', type: 'date', required: true },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
  })
  app.save(diaries)

  const actions = new Collection({
    name: 'actions',
    type: 'base',
    listRule: "@request.auth.id != '' && user = @request.auth.id",
    viewRule: "@request.auth.id != '' && user = @request.auth.id",
    createRule: "@request.auth.id != '' && user = @request.auth.id",
    updateRule: "@request.auth.id != '' && user = @request.auth.id",
    deleteRule: "@request.auth.id != '' && user = @request.auth.id",
    fields: [
      {
        name: 'user',
        type: 'relation',
        required: true,
        collectionId: '_pb_users_auth_',
        cascadeDelete: true,
        maxSelect: 1,
      },
      { name: 'title', type: 'text', required: true },
      {
        name: 'type',
        type: 'select',
        required: true,
        values: ['microaction', 'decision'],
        maxSelect: 1,
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        values: ['pending', 'completed'],
        maxSelect: 1,
      },
      { name: 'deadline', type: 'date', required: true },
      { name: 'original_date', type: 'date', required: true },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
  })
  app.save(actions)

  const knowledge = new Collection({
    name: 'knowledge_base',
    type: 'base',
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: 'content', type: 'text', required: true },
      { name: 'source', type: 'text' },
      { name: 'embedding', type: 'vector', dimensions: 1536, distance: 'cosine' },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
  })
  app.save(knowledge)
})
