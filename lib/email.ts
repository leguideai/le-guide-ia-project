import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

const fromEmail = process.env.RESEND_FROM_EMAIL || 'Le Guide IA <samba@leguideai.com>'

export async function sendRegistrationEmail(name: string, email: string) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const firstName = name.split(' ')[0]
    const textContent = `Bonjour ${firstName},\n\nFélicitations ! Votre inscription au Bootcamp PRO 2 par LE GUIDE IA a bien été enregistrée.\n\nDétails de la formation :\n- Dates : Du 31 Août au 6 Septembre 2026\n- Format : 7 Sessions intensives en direct + Replays\n- Instructeur : Alfred Dah (Expert CISA & IA)\n\nPour accéder à votre espace membre : https://leguideai.com/login\n\nÀ très bientôt,\nL'équipe LE GUIDE IA & Alfred Dah`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      reply_to: 'samba@leguideai.com',
      subject: 'Confirmation de votre inscription au Bootcamp — LE GUIDE IA',
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0d1117; color: #e6edf3; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #1f6feb 0%, #0969da 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
            .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; color: #c9d1d9; }
            .content p { margin-bottom: 16px; }
            .box { background-color: #21262d; border-left: 4px solid #58a6ff; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .cta-button { display: inline-block; background-color: #238636; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin-top: 16px; text-align: center; }
            .footer { background-color: #0d1117; padding: 24px; text-align: center; font-size: 12px; color: #8b949e; border-top: 1px solid #21262d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LE GUIDE IA</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${firstName}</strong>,</p>
              <p>Félicitations ! Votre inscription au <strong>Bootcamp PRO 2</strong> par LE GUIDE IA a bien été enregistrée.</p>
              
              <div class="box">
                <strong style="color: #ffffff;">Détails de la formation :</strong><br>
                📅 <strong>Dates :</strong> Du 31 Août au 6 Septembre 2026<br>
                🎓 <strong>Format :</strong> 7 Sessions intensives en direct + Replays<br>
                👨‍🏫 <strong>Instructeur :</strong> Alfred Dah (Expert CISA & IA)
              </div>

              <p>Pour accéder dès maintenant à votre espace apprenant et consulter le programme détaillé :</p>
              <p style="text-align: center;">
                <a href="https://leguideai.com/login" class="cta-button">Accéder à mon Espace Membre</a>
              </p>
              
              <p>Si vous avez la moindre question, répondez directement à cet email ou contactez-nous sur WhatsApp.</p>
              <p>À très bientôt,<br><strong>L'équipe LE GUIDE IA & Alfred Dah</strong></p>
            </div>
            <div class="footer">
              © 2026 LE GUIDE IA — Tous droits réservés.<br>
              Pour ne plus recevoir ces messages, répondez à cet email avec "Désinscription".
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Error sending registration email:', error)
    return { success: false, error }
  }
}

export async function sendPaymentConfirmationEmail(name: string, email: string, method: string) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const firstName = name.split(' ')[0]
    const textContent = `Bonjour ${firstName},\n\nNous avons bien reçu votre demande de validation de paiement pour le Bootcamp PRO 2.\nMoyen de paiement : ${method}\nStatut : En cours de vérification par notre équipe (sous 24h)\n\nDès la validation, votre accès sera activé dans votre Espace Membre : https://leguideai.com/dashboard\n\nMerci pour votre confiance,\nL'équipe LE GUIDE IA`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      reply_to: 'samba@leguideai.com',
      subject: 'Confirmation de paiement reçu — LE GUIDE IA',
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0d1117; color: #e6edf3; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #161b22; border: 1px solid #30363d; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #238636 0%, #2ea043 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; }
            .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; color: #c9d1d9; }
            .box { background-color: #21262d; border-left: 4px solid #3fb950; border-radius: 8px; padding: 16px; margin: 24px 0; }
            .cta-button { display: inline-block; background-color: #1f6feb; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin-top: 16px; text-align: center; }
            .footer { background-color: #0d1117; padding: 24px; text-align: center; font-size: 12px; color: #8b949e; border-top: 1px solid #21262d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Paiement Reçu — LE GUIDE IA</h1>
            </div>
            <div class="content">
              <p>Bonjour <strong>${firstName}</strong>,</p>
              <p>Nous avons bien reçu votre demande de validation de paiement pour le <strong>Bootcamp PRO 2</strong>.</p>
              
              <div class="box">
                <strong style="color: #ffffff;">Récapitulatif :</strong><br>
                💳 <strong>Moyen de paiement :</strong> ${method}<br>
                ⏳ <strong>Statut :</strong> En cours de vérification par notre équipe (sous 24h)
              </div>

              <p>Dès la validation effective de la transaction, votre accès complet au Bootcamp et à toutes les ressources sera activé dans votre Espace Membre.</p>
              
              <p style="text-align: center;">
                <a href="https://leguideai.com/dashboard" class="cta-button">Voir mon Espace Membre</a>
              </p>
              
              <p>Merci pour votre confiance !<br><strong>L'équipe LE GUIDE IA</strong></p>
            </div>
            <div class="footer">
              © 2026 LE GUIDE IA — Tous droits réservés.
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
    return { success: false, error }
  }
}

export interface ManualEnrollmentEmailParams {
  fullName: string
  email: string
  courseTitle: string
  amount?: number | string
  paymentMethod?: string
  transactionRef?: string
  tempPassword?: string
  isNewAccount?: boolean
}

export async function sendManualEnrollmentEmail(params: ManualEnrollmentEmailParams) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const {
      fullName,
      email,
      courseTitle,
      amount = "99 000 FCFA",
      paymentMethod = "Inscription Manuelle (Admin)",
      transactionRef = "ADM-CONFIRMED",
      tempPassword,
      isNewAccount = false
    } = params

    const firstName = fullName ? fullName.split(' ')[0] : email.split('@')[0]
    const formattedAmount = typeof amount === "number" ? `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA` : String(amount)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leguideai.com"
    const loginUrl = `${siteUrl}/login`
    const dashboardUrl = `${siteUrl}/dashboard`

    const textContent = `Bonjour ${firstName},\n\nFélicitations ! Votre inscription au ${courseTitle} a été validée avec succès par l'administration Le Guide IA.\n\nAccédez à votre espace membre : ${loginUrl}\n\nÀ très vite,\nAlfred Dah & L'équipe Pédagogique LE GUIDE IA`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      reply_to: 'samba@leguideai.com',
      subject: `🎉 Votre accès au ${courseTitle} est activé ! — LE GUIDE IA`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Accès Confirmé - LE GUIDE IA</title>
          <style>
            body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 24px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%); padding: 36px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #f0f9ff; font-weight: 600; opacity: 0.95; }
            .content { padding: 32px 28px; line-height: 1.65; font-size: 14px; color: #cbd5e1; }
            .welcome-title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
            .card-box { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin: 20px 0; }
            .card-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: block; }
            .credentials-box { background: linear-gradient(180deg, #1e293b 0%, #172554 100%); border: 1.5px solid #38bdf8; border-radius: 14px; padding: 20px; margin: 20px 0; }
            .info-row { padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
            .info-row:last-child { border-bottom: none; }
            .info-label { color: #94a3b8; font-weight: 600; }
            .info-value { color: #f8fafc; font-weight: 700; float: right; }
            .cta-button { display: block; width: fit-content; margin: 26px auto 10px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-align: center; font-size: 15px; box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4); }
            .footer { background-color: #090d16; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LE GUIDE IA</h1>
              <p>Plateforme Officielle de Formation & Certification en IA</p>
            </div>
            <div class="content">
              <p class="welcome-title">Bonjour <strong>${firstName}</strong> 👋,</p>
              <p>
                Félicitations ! Votre inscription au <strong>${courseTitle}</strong> a été validée et activée avec succès par l'administration Le Guide IA.
              </p>
              
              ${isNewAccount && tempPassword ? `
              <!-- NOUVEAU COMPTE CRÉÉ -->
              <div class="credentials-box">
                <span class="card-title" style="color: #38bdf8;">🔐 Vos Identifiants de Connexion</span>
                <p style="margin: 4px 0 14px; font-size: 12px; color: #94a3b8;">
                  Un compte apprenant a été spécialement créé pour vous sur la plateforme :
                </p>
                <div class="info-row">
                  <span class="info-label">Email :</span>
                  <span class="info-value" style="font-family: monospace; color: #38bdf8;">${email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Mot de passe temporaire :</span>
                  <span class="info-value" style="font-family: monospace; color: #facc15; font-size: 14px;">${tempPassword}</span>
                </div>
                <div style="clear: both;"></div>
                <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8; font-style: italic;">
                  💡 Conseil : Vous pourrez modifier votre mot de passe à tout moment une fois connecté dans votre Espace Membre.
                </p>
              </div>
              ` : `
              <!-- COMPTE DÉJÀ EXISTANT -->
              <div class="card-box" style="border-left: 4px solid #38bdf8;">
                <span class="card-title" style="color: #38bdf8;">🔐 Accès à votre Espace Membre</span>
                <p style="margin: 4px 0; font-size: 13px;">
                  Ce Bootcamp a été rattaché à votre compte existant (<strong>${email}</strong>). Connectez-vous simplement avec votre mot de passe habituel.
                </p>
              </div>
              `}

              <!-- RÉCAPITULATIF RÈGLEMENT & JUSTIFICATIF -->
              <div class="card-box">
                <span class="card-title" style="color: #10b981;">📋 Justificatif d'Inscription & Règlement</span>
                <div class="info-row">
                  <span class="info-label">Bootcamp :</span>
                  <span class="info-value">${courseTitle}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Moyen de règlement :</span>
                  <span class="info-value">${paymentMethod}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Réf. Justificatif :</span>
                  <span class="info-value" style="font-family: monospace;">${transactionRef}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Montant :</span>
                  <span class="info-value" style="color: #10b981;">${formattedAmount}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Statut Accès :</span>
                  <span class="info-value" style="color: #38bdf8;">✅ 100% DÉBLOQUÉ</span>
                </div>
                <div style="clear: both;"></div>
              </div>

              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="${loginUrl}" class="cta-button" style="color: #ffffff !important;">Accéder à mon Espace Apprenant</a>
              </div>

              <div style="background-color: #1e293b; border-radius: 12px; padding: 14px; margin-top: 24px; font-size: 12px; color: #94a3b8;">
                <strong style="color: #e2e8f0;">Besoin d'aide ou question ?</strong><br>
                Notre équipe est à votre disposition pour vous accompagner. Vous pouvez répondre directement à cet email.
              </div>

              <p style="margin-top: 24px; font-size: 13px;">
                À très vite dans le Bootcamp !<br>
                <strong>Alfred Dah & L'équipe Pédagogique LE GUIDE IA</strong>
              </p>
            </div>
            <div class="footer">
              © 2026 LE GUIDE IA — Tous droits réservés.<br>
              Centre d'Excellence en Intelligence Artificielle & Automatisation
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Error sending manual enrollment email:', error)
    return { success: false, error }
  }
}
