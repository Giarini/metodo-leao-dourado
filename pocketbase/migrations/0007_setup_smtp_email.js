migrate(
  (app) => {
    try {
      const settings = app.settings()
      if (settings.meta) {
        settings.meta.appName = 'Jornada Leão Dourado'
        settings.meta.appUrl = 'https://www.jornadaleaodourado.com.br'
        settings.meta.senderName = 'Jornada Leão Dourado'
        app.save(settings)
      }
    } catch (err) {
      console.log('Settings update error:', err)
    }

    try {
      const users = app.findCollectionByNameOrId('users')
      if (users) {
        let changed = false
        if (users.passwordAuth && users.passwordAuth.enabled === false) {
          users.passwordAuth.enabled = true
          changed = true
        }
        if (changed) {
          app.save(users)
        }
      }
    } catch (err) {
      console.log('Users collection update error:', err)
    }
  },
  (app) => {
    // Revert is ignored since these are generic additive settings
  },
)
