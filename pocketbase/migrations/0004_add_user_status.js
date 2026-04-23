migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('status')) {
      users.fields.add(
        new SelectField({
          name: 'status',
          values: ['pending', 'active', 'blocked'],
          maxSelect: 1,
          required: false,
        }),
      )
      app.save(users)
    }

    try {
      const admin = app.findAuthRecordByEmail('users', 'fernando_adviser@uol.com.br')
      admin.set('status', 'active')
      admin.set('role', 'admin')
      app.save(admin)
    } catch (_) {
      const record = new Record(users)
      record.setEmail('fernando_adviser@uol.com.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      record.set('role', 'admin')
      record.set('status', 'active')
      record.set('unlocked_level', 5)
      app.save(record)
    }

    const allUsers = app.findRecordsByFilter('users', '1=1', '', 1000, 0)
    for (const u of allUsers) {
      if (!u.getString('status')) {
        u.set('status', 'active')
        app.save(u)
      }
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('status')
    app.save(users)
  },
)
