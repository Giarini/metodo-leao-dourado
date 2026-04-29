migrate(
  (app) => {
    const settings = app.settings()
    settings.meta.appUrl = 'https://www.jornadaleaodourado.com.br'
    app.save(settings)

    const users = app.findCollectionByNameOrId('users')
    if (users.resetPasswordTemplate) {
      users.resetPasswordTemplate.actionUrl =
        'https://www.jornadaleaodourado.com.br/reset-password?token={TOKEN}'
    }
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.resetPasswordTemplate) {
      users.resetPasswordTemplate.actionUrl = '{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}'
    }
    app.save(users)
  },
)
