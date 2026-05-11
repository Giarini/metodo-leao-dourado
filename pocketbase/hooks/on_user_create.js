onRecordCreateRequest((e) => {
  const isSuperuser = e.hasSuperuserAuth()
  const isAdmin = e.auth && e.auth.getString('role') === 'admin'

  if (!isSuperuser && !isAdmin) {
    e.record.set('role', 'student')
    e.record.set('status', 'pending')
    e.record.set('unlocked_level', 1)
  }

  e.next()
}, 'users')
