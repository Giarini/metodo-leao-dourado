onRecordCreate((e) => {
  if (!e.hasSuperuserAuth() && (!e.auth || e.auth.getString('role') !== 'admin')) {
    e.record.set('role', 'student')
    e.record.set('status', 'pending')
    e.record.set('unlocked_level', 1)
  }
  e.next()
}, '_pb_users_auth_')
