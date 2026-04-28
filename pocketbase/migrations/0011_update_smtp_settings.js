migrate(
  (app) => {
    const settings = app.settings()

    // PocketBase validates the senderAddress format when smtpEnable is true.
    // We use a fallback valid email address in case the secret is missing during local migration runs.
    const smtpUser = $secrets.get('SMTP_USER') || 'suporte@jornadaleaodourado.com.br'
    const smtpPassword = $secrets.get('SMTP_PASSWORD') || ''

    settings.meta.senderName = 'Jornada Leão Dourado'
    settings.meta.senderAddress = smtpUser

    settings.meta.smtpEnable = true
    settings.meta.smtpHost = 'smtp.hostinger.com'
    settings.meta.smtpPort = 465
    settings.meta.smtpUsername = smtpUser
    settings.meta.smtpPassword = smtpPassword

    app.save(settings)
  },
  (app) => {
    const settings = app.settings()

    settings.meta.smtpEnable = false
    settings.meta.smtpHost = ''
    settings.meta.smtpPort = 0
    settings.meta.smtpUsername = ''
    settings.meta.smtpPassword = ''

    app.save(settings)
  },
)
