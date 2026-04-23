migrate((app) => {
  const users = app.findCollectionByNameOrId('_pb_users_auth_')
  try {
    app.findAuthRecordByEmail('_pb_users_auth_', 'fernando_adviser@uol.com.br')
    return
  } catch (_) {}

  const record = new Record(users)
  record.setEmail('fernando_adviser@uol.com.br')
  record.setPassword('Skip@Pass')
  record.setVerified(true)
  record.set('name', 'Admin Fernando')
  record.set('role', 'admin')
  record.set('unlocked_level', 5)
  app.save(record)
})
