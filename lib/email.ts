import { Resend } from 'resend'

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

const fromEmail = process.env.RESEND_FROM_EMAIL || 'Le Guide IA <alfred@leguideai.com>'

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
      replyTo: 'alfred@leguideai.com',
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
      replyTo: 'alfred@leguideai.com',
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
      replyTo: 'alfred@leguideai.com',
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
              
              <div class="card-box" style="border-left: 4px solid #38bdf8;">
                <span class="card-title" style="color: #38bdf8;">🚀 Accès à votre Espace Membre</span>
                <p style="margin: 4px 0; font-size: 13px;">
                  Votre formation est associée à votre adresse email (<strong>${email}</strong>). Connectez-vous directement sur la plateforme pour accéder à vos cours et sessions en direct.
                </p>
              </div>

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

export interface AdminNewEnrollmentParams {
  fullName: string
  email: string
  whatsapp?: string
  country?: string
  courseTitle: string
  courseSlug?: string
  amount?: number | string
  paymentMethod?: string
  transactionRef?: string
  receiptUrl?: string | null
}

export async function sendAdminNewEnrollmentNotification(params: AdminNewEnrollmentParams) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping admin notification: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const {
      fullName,
      email,
      whatsapp,
      country,
      courseTitle,
      amount = "49 000 FCFA",
      paymentMethod = "Mobile Money Direct",
      transactionRef = "Non spécifiée",
      receiptUrl
    } = params

    const adminEmails = [
      process.env.ADMIN_NOTIFICATION_EMAIL,
      process.env.ADMIN_EMAIL,
      'alfred@leguideai.com',
      'contact@leguideai.com'
    ].filter(Boolean) as string[]

    const targetAdmins = Array.from(new Set(adminEmails))
    const cleanPhone = (whatsapp || '').replace(/[^0-9]/g, '')
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://leguideai.com'
    const adminUrl = `${siteUrl}/admin`
    const formattedAmount = typeof amount === "number" ? `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA` : String(amount)

    const textContent = `🚨 NOUVELLE INSCRIPTION BOOTCAMP À VALIDER !\n\nApprenant : ${fullName}\nEmail : ${email}\nWhatsApp : ${whatsapp || 'N/A'}\nPays : ${country || 'N/A'}\nFormation : ${courseTitle}\nMontant déclaré : ${formattedAmount}\nMéthode : ${paymentMethod}\nRéférence : ${transactionRef}\nPreuve : ${receiptUrl || 'Aucune capture'}\n\nAccédez au portail admin pour valider en 1 clic : ${adminUrl}`

    const data = await resend.emails.send({
      from: fromEmail,
      to: targetAdmins,
      replyTo: email,
      subject: `🚨 [Nouveau Paiement à Valider] ${fullName} — ${courseTitle}`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notification Administrateur</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 28px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 900; color: #ffffff; text-transform: uppercase; }
            .header p { margin: 4px 0 0; font-size: 13px; color: #fee2e2; }
            .content { padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .badge { display: inline-block; background-color: #fef3c7; color: #92400e; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 16px; }
            .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #1f2937; border-radius: 10px; overflow: hidden; }
            .info-table td { padding: 12px 16px; border-bottom: 1px solid #374151; font-size: 13px; }
            .info-table td.label { color: #9ca3af; font-weight: 600; width: 35%; }
            .info-table td.value { color: #f9fafb; font-weight: 700; }
            .receipt-box { background-color: #1f2937; border: 1px dashed #4b5563; border-radius: 10px; padding: 14px; text-align: center; margin: 16px 0; }
            .cta-admin { display: block; background: #2563eb; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 24px; border-radius: 10px; text-align: center; font-size: 14px; margin: 24px 0 12px; }
            .cta-wa { display: block; background: #16a34a; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px; text-align: center; font-size: 13px; }
            .footer { background-color: #0b0f19; padding: 20px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #1f2937; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LE GUIDE IA · Administration</h1>
              <p>Nouvelle demande d'inscription et paiement reçus</p>
            </div>
            <div class="content">
              <div class="badge">⏳ En attente de votre validation (Mobile Money)</div>
              <p style="margin-top: 0;">Un participant vient d'effectuer une déclaration de paiement pour le Bootcamp suivant :</p>
              <h2 style="color: #38bdf8; font-size: 18px; margin: 0 0 16px;">${courseTitle}</h2>

              <table class="info-table">
                <tr>
                  <td class="label">Apprenant</td>
                  <td class="value">${fullName}</td>
                </tr>
                <tr>
                  <td class="label">Email</td>
                  <td class="value"><a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td class="label">WhatsApp</td>
                  <td class="value">${whatsapp || 'Non renseigné'} ${cleanPhone ? `(<a href="https://wa.me/${cleanPhone}" style="color: #4ade80;">Contacter</a>)` : ''}</td>
                </tr>
                <tr>
                  <td class="label">Pays</td>
                  <td class="value">${country || 'N/A'}</td>
                </tr>
                <tr>
                  <td class="label">Montant</td>
                  <td class="value" style="color: #4ade80;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td class="label">Moyen de paiement</td>
                  <td class="value">${paymentMethod}</td>
                </tr>
                <tr>
                  <td class="label">Référence déclarée</td>
                  <td class="value" style="font-family: monospace;">${transactionRef}</td>
                </tr>
              </table>

              ${receiptUrl ? `
                <div class="receipt-box">
                  <span style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 8px;">📸 Preuve de paiement jointe :</span>
                  <a href="${receiptUrl}" target="_blank" style="color: #38bdf8; font-weight: bold; text-decoration: underline;">
                    Voir la capture d'écran / Reçu de virement
                  </a>
                </div>
              ` : ''}

              <a href="${adminUrl}" class="cta-admin">
                Accéder à l'Administration &amp; Valider l'accès en 1-clic
              </a>

              ${cleanPhone ? `
                <a href="https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Bonjour ${fullName}, j'ai bien reçu votre demande d'inscription au Bootcamp ${courseTitle}. Je procède à la validation de votre accès. Bienvenue !`)}" class="cta-wa">
                  Écrire directement à l'apprenant sur WhatsApp
                </a>
              ` : ''}
            </div>
            <div class="footer">
              Système de Notification Automatique · LE GUIDE IA
            </div>
          </div>
        </body>
        </html>
      `,
    })
    return { success: true, data }
  } catch (error) {
    console.error('Error sending admin enrollment notification email:', error)
    return { success: false, error }
  }
}

export interface StripeSuccessEmailParams {
  fullName: string
  email: string
  courseTitle: string
  amount?: number | string
  transactionRef?: string
  tempPassword?: string
  isNewAccount?: boolean
}

export async function sendStripeSuccessEmail(params: StripeSuccessEmailParams) {
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
      amount = "149 000 FCFA",
      transactionRef = "LGI-STRIPE-OK",
      tempPassword,
      isNewAccount = false
    } = params

    const firstName = fullName ? fullName.split(' ')[0] : email.split('@')[0]
    const formattedAmount = typeof amount === "number" ? `${amount.toLocaleString("fr-FR")} FCFA` : String(amount)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leguideai.com"
    const loginUrl = `${siteUrl}/login`
    const dashboardUrl = `${siteUrl}/dashboard`

    const textContent = `Bonjour ${firstName},\n\nFélicitations ! Votre paiement par carte bancaire pour le ${courseTitle} a été validé avec succès.\nVos accès sont immédiatement débloqués.\n\nAccédez à votre espace apprenant : ${loginUrl}\n\nÀ très vite dans le Bootcamp,\nAlfred Dah & L'équipe LE GUIDE IA`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject: `🎉 Confirmation de Paiement & Accès Immédiat au ${courseTitle} — LE GUIDE IA`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Paiement Confirmé & Accès Débloqué - LE GUIDE IA</title>
          <style>
            body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 24px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
            .header { background: linear-gradient(135deg, #059669 0%, #10b981 50%, #0284c7 100%); padding: 36px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #ecfdf5; font-weight: 600; opacity: 0.95; }
            .content { padding: 32px 28px; line-height: 1.65; font-size: 14px; color: #cbd5e1; }
            .welcome-title { font-size: 18px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
            .badge-instant { display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
            .card-box { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin: 20px 0; }
            .card-title { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: block; }
            .credentials-box { background: linear-gradient(180deg, #1e293b 0%, #064e3b 100%); border: 1.5px solid #10b981; border-radius: 14px; padding: 20px; margin: 20px 0; }
            .info-row { padding: 8px 0; border-bottom: 1px solid #334155; font-size: 13px; }
            .info-row:last-child { border-bottom: none; }
            .info-label { color: #94a3b8; font-weight: 600; }
            .info-value { color: #f8fafc; font-weight: 700; float: right; }
            .cta-button { display: block; width: fit-content; margin: 26px auto 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; text-align: center; font-size: 15px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
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
              <span class="badge-instant">⚡ PAIEMENT EN LIGNE VALIDÉ — ACCÈS IMMÉDIAT</span>
              <p class="welcome-title">Bonjour <strong>${firstName}</strong> 👋,</p>
              <p>
                Félicitations ! Votre paiement par carte bancaire pour le <strong>${courseTitle}</strong> a été validé avec succès.
              </p>
              <p>
                Vos accès sont désormais <strong>100% opérationnels</strong>. Vous pouvez dès à présent rejoindre votre tableau de bord et découvrir votre formation.
              </p>
              
              <div class="card-box" style="border-left: 4px solid #10b981;">
                <span class="card-title" style="color: #34d399;">🚀 Accès à votre Espace Membre</span>
                <p style="margin: 4px 0; font-size: 13px;">
                  Ce Bootcamp a été automatiquement débloqué sur votre compte (<strong>${email}</strong>). Connectez-vous simplement sur la plateforme pour accéder à vos contenus et directs.
                </p>
              </div>

              <!-- RÉCAPITULATIF RÈGLEMENT OFFICIEL -->
              <div class="card-box">
                <span class="card-title" style="color: #38bdf8;">📋 Reçu de Paiement Sécurisé</span>
                <div class="info-row">
                  <span class="info-label">Bootcamp :</span>
                  <span class="info-value">${courseTitle}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Moyen de paiement :</span>
                  <span class="info-value">Carte Bancaire Internationale (Stripe)</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Réf. Transaction :</span>
                  <span class="info-value" style="font-family: monospace;">${transactionRef}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Montant réglé :</span>
                  <span class="info-value" style="color: #10b981;">${formattedAmount}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Statut :</span>
                  <span class="info-value" style="color: #10b981;">✅ PAYÉ & DÉBLOQUÉ</span>
                </div>
                <div style="clear: both;"></div>
              </div>

              <div style="text-align: center; margin: 28px 0 16px;">
                <a href="${loginUrl}" class="cta-button" style="color: #ffffff !important;">Accéder à mon Espace Apprenant</a>
              </div>

              <div style="background-color: #1e293b; border-radius: 12px; padding: 14px; margin-top: 24px; font-size: 12px; color: #94a3b8;">
                <strong style="color: #e2e8f0;">Support & Accompagnement :</strong><br>
                Notre équipe est à votre disposition. Vous pouvez répondre directement à cet email ou nous contacter sur WhatsApp au +226 75 75 72 73.
              </div>

              <p style="margin-top: 24px; font-size: 13px;">
                Bienvenue parmi nous et bon apprentissage !<br>
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
    console.error('Error sending Stripe success email:', error)
    return { success: false, error }
  }
}

