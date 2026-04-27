migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'fernando_adviser@uol.com.br')
      record.set('role', 'admin')
      record.set('status', 'active')
      record.set('unlocked_level', 5)
      app.save(record)
      return
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('fernando_adviser@uol.com.br')
    record.setPassword('12345678')
    record.setVerified(true)
    record.set('name', 'Admin Suporte')
    record.set('role', 'admin')
    record.set('status', 'active')
    record.set('unlocked_level', 5)
    app.save(record)
  },
  (app) => {
    // Revert not strictly necessary for seed update
  },
)
