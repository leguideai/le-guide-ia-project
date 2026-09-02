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
    const textContent = `Bonjour ${firstName},\n\nFélicitations ! Votre inscription au Bootcamp PRO 2 par LE GUIDE IA a bien été enregistrée.\n\nDétails de la formation :\n- Dates : Du 31 Août au 6 Septembre 2026\n- Format : 7 Sessions intensives en direct + Replays\n- Instructeur : Alfred Dah (Expert & IA)\n\nPour accéder à votre espace membre : https://leguideai.com/login\n\nÀ très bientôt,\nL'équipe LE GUIDE IA & Alfred Dah`

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
                👨‍🏫 <strong>Instructeur :</strong> Alfred Dah (Expert IA)
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
  originalPrice?: number | string
  subscriptionCredit?: number | string
  subscriptionPlan?: string
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
      originalPrice,
      subscriptionCredit,
      subscriptionPlan,
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
    const hasDeduction = subscriptionCredit && Number(subscriptionCredit) > 0
    const formattedOriginal = originalPrice ? (typeof originalPrice === "number" ? `${originalPrice.toLocaleString('fr-FR')} FCFA` : String(originalPrice)) : null
    const formattedDeduction = hasDeduction ? `${Number(subscriptionCredit).toLocaleString('fr-FR')} FCFA` : null

    const textContent = `🚨 NOUVELLE INSCRIPTION BOOTCAMP À VALIDER !\n\nApprenant : ${fullName}\nEmail : ${email}\nWhatsApp : ${whatsapp || 'N/A'}\nPays : ${country || 'N/A'}\nFormation : ${courseTitle}\n${hasDeduction ? `Tarif catalogue : ${formattedOriginal}\nDéduction Abonnement Cercle IA (${subscriptionPlan || 'Actif'}) : -${formattedDeduction}\nNet à vérifier : ${formattedAmount}` : `Montant déclaré : ${formattedAmount}`}\nMéthode : ${paymentMethod}\nRéférence : ${transactionRef}\nPreuve : ${receiptUrl || 'Aucune capture'}\n\nAccédez au portail admin pour valider en 1 clic : ${adminUrl}`

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
                ${hasDeduction ? `
                <tr>
                  <td class="label">Tarif catalogue</td>
                  <td class="value" style="color: #94a3b8; text-decoration: line-through;">${formattedOriginal}</td>
                </tr>
                <tr>
                  <td class="label">Déduction Cercle IA</td>
                  <td class="value" style="color: #4ade80;">-${formattedDeduction} (${subscriptionPlan || 'Abonnement Actif'})</td>
                </tr>
                ` : ''}
                <tr>
                  <td class="label">${hasDeduction ? 'Net payé à vérifier' : 'Montant'}</td>
                  <td class="value" style="color: #4ade80; font-size: 15px;">${formattedAmount}</td>
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

              ${hasDeduction ? `
                <div style="background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #86efac;">
                  🎁 <strong>Avantage Cercle IA appliqué :</strong> Cet apprenant a un abonnement actif (${subscriptionPlan || 'Cercle IA'}). La mensualité a été déduite à 100% du prix du Bootcamp.
                </div>
              ` : ''}

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
  originalPrice?: number | string
  subscriptionCredit?: number | string
  subscriptionPlan?: string
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
      originalPrice,
      subscriptionCredit,
      subscriptionPlan,
      transactionRef = "LGI-STRIPE-OK",
      tempPassword,
      isNewAccount = false
    } = params

    const firstName = fullName ? fullName.split(' ')[0] : email.split('@')[0]
    const formattedAmount = typeof amount === "number" ? `${amount.toLocaleString("fr-FR")} FCFA` : String(amount)
    const hasDeduction = subscriptionCredit && Number(subscriptionCredit) > 0
    const formattedOriginal = originalPrice ? (typeof originalPrice === "number" ? `${originalPrice.toLocaleString('fr-FR')} FCFA` : String(originalPrice)) : null
    const formattedDeduction = hasDeduction ? `${Number(subscriptionCredit).toLocaleString('fr-FR')} FCFA` : null

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leguideai.com"
    const loginUrl = `${siteUrl}/login`
    const dashboardUrl = `${siteUrl}/dashboard`

    const textContent = `Bonjour ${firstName},\n\nFélicitations ! Votre paiement par carte bancaire pour le ${courseTitle} a été validé avec succès.\n${hasDeduction ? `Tarif catalogue : ${formattedOriginal}\nDéduction Membre Cercle IA (${subscriptionPlan || 'Actif'}) : -${formattedDeduction} (100% Déduit)\nMontant net réglé : ${formattedAmount}\n` : `Montant réglé : ${formattedAmount}\n`}Vos accès sont immédiatement débloqués.\n\nAccédez à votre espace apprenant : ${loginUrl}\n\nÀ très vite dans le Bootcamp,\nAlfred Dah & L'équipe LE GUIDE IA`

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

              ${hasDeduction ? `
                <div style="background-color: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); border-radius: 14px; padding: 16px 20px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 13px; color: #86efac; line-height: 1.5;">
                    🎁 <strong>Avantage Cercle IA activé :</strong> En tant que membre actif (${subscriptionPlan || 'Pass Cercle IA'}), votre cotisation a été <strong>intégralement déduite (100%)</strong> du prix de votre Bootcamp !
                  </p>
                </div>
              ` : ''}

              <!-- RÉCAPITULATIF RÈGLEMENT OFFICIEL -->
              <div class="card-box">
                <span class="card-title" style="color: #38bdf8;">📋 Reçu de Paiement Sécurisé</span>
                <div class="info-row">
                  <span class="info-label">Bootcamp :</span>
                  <span class="info-value">${courseTitle}</span>
                </div>
                ${hasDeduction ? `
                <div class="info-row">
                  <span class="info-label">Tarif catalogue :</span>
                  <span class="info-value" style="color: #94a3b8; text-decoration: line-through;">${formattedOriginal}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Déduction Membre Cercle IA :</span>
                  <span class="info-value" style="color: #34d399;">-${formattedDeduction} (${subscriptionPlan || 'Abonnement Actif'})</span>
                </div>
                ` : ''}
                <div class="info-row">
                  <span class="info-label">Moyen de paiement :</span>
                  <span class="info-value">Carte Bancaire Internationale (Stripe)</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Réf. Transaction :</span>
                  <span class="info-value" style="font-family: monospace;">${transactionRef}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">${hasDeduction ? 'Montant net réglé :' : 'Montant réglé :'}</span>
                  <span class="info-value" style="color: #10b981; font-size: 15px;">${formattedAmount}</span>
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

// EMAIL 1: Confirmation d'Inscription Immédiate à la Masterclass
export async function sendMasterclassRegistrationEmail(
  name: string,
  email: string,
  session: {
    title: string
    scheduledAt?: string
    dateDisplay?: string
    whatsappGroupUrl?: string
    youtubeLiveUrl?: string
    instructor?: string
  }
) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const firstName = name.split(' ')[0] || 'Apprenant'
    const sessionTitle = session.title || "Masterclass IA en Direct"
    const instructor = session.instructor || "Alfred Dah"
    const dateFormatted = session.dateDisplay || (session.scheduledAt ? new Date(session.scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "À venir")
    const whatsappUrl = session.whatsappGroupUrl || "https://chat.whatsapp.com/leguideai-masterclass"
    const youtubeUrl = session.youtubeLiveUrl || "https://meet.google.com"

    const textContent = `Bonjour ${firstName},\n\nVotre inscription à la Masterclass IA "${sessionTitle}" est bien confirmée !\n\nDétails de la session :\n- Date & Heure : ${dateFormatted}\n- Intervenant : ${instructor}\n- Format : Direct interactif 100% gratuit sur Google Meet\n\n1. Rejoindre le Groupe WhatsApp des Apprenants : ${whatsappUrl}\n2. Lien du direct Google Meet : ${youtubeUrl}\n\nÀ très bientôt,\nAlfred Dah & L'équipe LE GUIDE IA`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject: `🎉 Inscription Confirmée : Votre place pour la Masterclass IA est réservée !`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation Masterclass IA</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 18px; overflow: hidden; }
            .header { background-color: #1e293b; padding: 32px 24px; text-align: center; border-bottom: 2px solid #10b981; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
            .content { padding: 32px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .badge { display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
            .card-box { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; }
            .btn-wa { display: inline-block; background-color: #16a34a; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin: 6px 4px; text-align: center; font-size: 14px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35); }
            .btn-meet { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; margin: 6px 4px; text-align: center; font-size: 14px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); }
            .footer { background-color: #090d16; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LE GUIDE IA</h1>
              <p>Centre d'Excellence en Intelligence Artificielle</p>
            </div>
            <div class="content">
              <span class="badge">🎟️ PLACE RÉSERVÉE AVEC SUCCÈS</span>
              <p style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 0;">Bonjour ${firstName} 👋,</p>
              <p>
                Votre inscription à la Masterclass IA <strong>"${sessionTitle}"</strong> a bien été enregistrée.
              </p>
              
              <div class="card-box">
                <strong style="color: #ffffff; font-size: 14px; display: block; margin-bottom: 8px;">📋 Récapitulatif de la session :</strong>
                📅 <strong>Date & Heure :</strong> ${dateFormatted}<br>
                👨‍🏫 <strong>Intervenant :</strong> ${instructor}<br>
                ⚡ <strong>Format :</strong> Direct 100% sur Google Meet & Q&A interactif<br>
                🎟️ <strong>Tarif :</strong> 100% Gratuit
              </div>

              <div style="background: linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1.5px solid #16a34a; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0 16px;">
                <p style="font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 8px;">
                  💬 Rejoignez le Groupe WhatsApp des Apprenants
                </p>
                <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 16px; line-height: 1.5;">
                  Ce groupe regroupe tous les participants pour recevoir les rappels en direct, poser vos questions, échanger avec Alfred Dah et accéder aux ressources partagées.
                </p>
                <a href="${whatsappUrl}" class="btn-wa" target="_blank">👉 Intégrer le Groupe WhatsApp</a>
              </div>

              <p style="margin-bottom: 8px; text-align: center; font-weight: 700; color: #ffffff;">Lien du Direct Google Meet :</p>
              <div style="text-align: center; margin: 10px 0 20px;">
                <a href="${youtubeUrl}" class="btn-meet" target="_blank">🎥 Rejoindre sur Google Meet</a>
              </div>

              <div style="background-color: #1e293b; border-radius: 10px; padding: 14px; font-size: 12px; color: #94a3b8; border-left: 3px solid #16a34a;">
                💡 <strong>Conseil :</strong> Rejoignez le groupe WhatsApp dès maintenant pour ne pas manquer le coup d'envoi du direct.
              </div>

              <p style="margin-top: 24px;">
                À très bientôt en direct,<br>
                <strong>${instructor} & L'équipe LE GUIDE IA</strong>
              </p>
            </div>
            <div class="footer">
              © 2026 LE GUIDE IA — Tous droits réservés.
            </div>
          </div>
        </body>
        </html>
      `
    })
    return { success: true, data }
  } catch (error) {
    console.error('Error sending masterclass registration email:', error)
    return { success: false, error }
  }
}

// EMAIL 2 & 3: Rappels Automatisés Masterclass (J-2, H-1 ou Personnalisé)
export async function sendMasterclassReminderEmail(
  name: string,
  email: string,
  session: {
    title?: string
    scheduledAt?: string
    dateDisplay?: string
    whatsappGroupUrl?: string
    youtubeLiveUrl?: string
    instructor?: string
  },
  reminderType: 'j_minus_2' | 'h_minus_1' | 'custom',
  customMessage?: string
) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const firstName = name.split(' ')[0] || 'Apprenant'
    const sessionTitle = session.title || "Masterclass IA en Direct"
    const instructor = session.instructor || "Alfred Dah"
    const dateFormatted = session.dateDisplay || (session.scheduledAt ? new Date(session.scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Ce Dimanche à 19h00 GMT")
    const whatsappUrl = session.whatsappGroupUrl || "https://chat.whatsapp.com/leguideai-masterclass"
    const youtubeUrl = session.youtubeLiveUrl || "https://meet.google.com"

    let subject = `⏳ Rappel : Votre Masterclass IA en direct (${dateFormatted})`
    let badgeText = `⏳ RAPPEL SESSION MASTERCLASS`
    let mainHeading = `Votre Masterclass IA approche !`
    let introText = `Nous vous rappelons que votre session interactive <strong>"${sessionTitle}"</strong> aura lieu <strong>${dateFormatted}</strong> sur Google Meet.`

    if (reminderType === 'j_minus_2') {
      subject = `⏳ Dans 48h : Masterclass IA en Direct avec ${instructor}`
      badgeText = `⏳ RAPPEL : J-2 AVANT LE DIRECT`
      mainHeading = `Votre Masterclass en direct dans 48 heures !`
      introText = `Plus que 2 jours avant notre rendez-vous <strong>"${sessionTitle}"</strong> prévu <strong>${dateFormatted}</strong> sur Google Meet.`
    } else if (reminderType === 'h_minus_1') {
      subject = `🔴 EN DIRECT DANS 1 HEURE : Masterclass IA avec ${instructor}`
      badgeText = `🔴 DIRECT DANS 60 MINUTES`
      mainHeading = `La Masterclass démarre dans 1 heure !`
      introText = `Préparez-vous ! La session interactive <strong>"${sessionTitle}"</strong> commence dans quelques instants sur Google Meet.`
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 18px; overflow: hidden; }
          .header { background-color: #1e293b; padding: 28px 24px; text-align: center; border-bottom: 2px solid ${reminderType === 'h_minus_1' ? '#ef4444' : '#10b981'}; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 900; color: #ffffff; }
          .content { padding: 32px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
          .badge { display: inline-block; background-color: ${reminderType === 'h_minus_1' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; border: 1px solid ${reminderType === 'h_minus_1' ? '#ef4444' : '#10b981'}; color: ${reminderType === 'h_minus_1' ? '#f87171' : '#34d399'}; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
          .card-box { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin: 20px 0; }
          .btn-wa { display: inline-block; background-color: #16a34a; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 26px; border-radius: 10px; margin: 6px 4px; text-align: center; font-size: 13px; }
          .btn-meet { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 14px 26px; border-radius: 10px; margin: 6px 4px; text-align: center; font-size: 13px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); }
          .footer { background-color: #090d16; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LE GUIDE IA</h1>
          </div>
          <div class="content">
            <span class="badge">${badgeText}</span>
            <p style="font-size: 17px; font-weight: bold; color: #ffffff; margin-top: 0;">${mainHeading}</p>
            <p>Bonjour <strong>${firstName}</strong>,</p>
            <p>${introText}</p>
            
            ${customMessage ? `<div style="background-color: #1e293b; padding: 14px; border-radius: 8px; margin: 16px 0; border-left: 3px solid #10b981; font-size: 13px;">${customMessage}</div>` : ''}

            <div class="card-box">
              <strong style="color: #ffffff; font-size: 14px; display: block; margin-bottom: 8px;">📍 Informations du Direct :</strong>
              📅 <strong>Date :</strong> ${dateFormatted}<br>
              👨‍🏫 <strong>Formateur :</strong> ${instructor}<br>
              🎯 <strong>Thème :</strong> ${sessionTitle}<br>
              💻 <strong>Plateforme :</strong> Google Meet (Session en direct)
            </div>

            <p style="text-align: center; margin-bottom: 8px; font-weight: bold;">Accédez au direct et au groupe des apprenants :</p>
            <div style="text-align: center; margin: 16px 0 24px;">
              <a href="${youtubeUrl}" class="btn-meet" target="_blank">🎥 Rejoindre sur Google Meet</a>
              <a href="${whatsappUrl}" class="btn-wa" target="_blank">💬 Groupe WhatsApp Masterclass</a>
            </div>

            <p style="font-size: 13px; color: #94a3b8;">
              N'hésitez pas à poser vos questions en direct dans Google Meet ou dans le groupe WhatsApp.
            </p>

            <p style="margin-top: 24px;">
              À très vite,<br>
              <strong>${instructor} & L'équipe LE GUIDE IA</strong>
            </p>
          </div>
          <div class="footer">
            © 2026 LE GUIDE IA — Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `Bonjour ${firstName},\n\n${mainHeading}\n\n${introText}\n\nDate : ${dateFormatted}\nLien Google Meet : ${youtubeUrl}\nGroupe WhatsApp des Apprenants : ${whatsappUrl}\n\nÀ très vite,\n${instructor}`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject,
      text: textContent,
      html: htmlContent
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending masterclass reminder email:', error)
    return { success: false, error }
  }
}

// EMAIL 4: Invitation Spéciale à Tous les Membres de la Plateforme
export async function sendMasterclassPlatformInvitationEmail(
  name: string,
  email: string,
  session: {
    title: string
    description?: string
    scheduledAt?: string
    dateDisplay?: string
    instructor?: string
    thumbnailUrl?: string
    whatsappGroupUrl?: string
    youtubeLiveUrl?: string
  }
) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const firstName = name.split(' ')[0] || 'Membre'
    const sessionTitle = session.title || "Masterclass IA Interactive en Direct"
    const instructor = session.instructor || "Alfred Dah"
    const dateFormatted = session.dateDisplay || (session.scheduledAt ? new Date(session.scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "Ce Dimanche à 19h00 GMT")
    const description = session.description || "Rejoignez-nous pour une session exclusive de formation pratique en direct sur Google Meet avec démonstrations et cas réels."
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leguideai.com"
    const registerUrl = `${siteUrl}/masterclass`

    const subject = `🎉 Invitation Spéciale : Masterclass IA en Direct avec ${instructor} (${dateFormatted})`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 24px auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #0284c7 0%, #38bdf8 50%, #6366f1 100%); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #f0f9ff; font-weight: 600; opacity: 0.95; }
          .content { padding: 32px 28px; line-height: 1.65; font-size: 14px; color: #cbd5e1; }
          .badge { display: inline-block; background-color: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-weight: 800; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 16px; }
          .poster { width: 100%; border-radius: 12px; margin: 16px 0; border: 1px solid #334155; }
          .card-box { background-color: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 20px; margin: 20px 0; }
          .cta-button { display: block; width: fit-content; margin: 26px auto 10px; background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%); color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 16px 36px; border-radius: 12px; text-align: center; font-size: 15px; box-shadow: 0 6px 20px rgba(2, 132, 199, 0.4); }
          .footer { background-color: #090d16; padding: 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LE GUIDE IA</h1>
            <p>Invitation Exclusive aux Membres de la Plateforme</p>
          </div>
          <div class="content">
            <span class="badge">🔴 NOUVELLE MASTERCLASS EN DIRECT</span>
            <p style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 0;">Bonjour ${firstName} 👋,</p>
            <p>
              Nous avons le plaisir de vous inviter à notre prochaine <strong>Masterclass IA Interactive en Direct</strong> animée par <strong>${instructor}</strong>.
            </p>

            ${session.thumbnailUrl ? `<img src="${session.thumbnailUrl}" alt="${sessionTitle}" class="poster" />` : ''}

            <div class="card-box">
              <strong style="color: #38bdf8; font-size: 16px; display: block; margin-bottom: 10px;">${sessionTitle}</strong>
              <p style="margin: 0 0 12px; font-size: 13px; color: #94a3b8;">${description}</p>
              <div style="border-top: 1px solid #334155; padding-top: 10px; font-size: 13px;">
                📅 <strong>Date & Heure :</strong> ${dateFormatted}<br>
                👨‍🏫 <strong>Intervenant :</strong> ${instructor}<br>
                🎟️ <strong>Tarif :</strong> 100% Gratuit (Accès Libre)<br>
                💻 <strong>Plateforme :</strong> Google Meet & Groupe WhatsApp des Apprenants
              </div>
            </div>

            <p style="text-align: center; font-weight: 700; color: #ffffff; margin-bottom: 6px;">
              Réservez votre place dès maintenant (1 clic si vous êtes connecté) :
            </p>
            <a href="${registerUrl}" class="cta-button">👉 Réserver ma place à la Masterclass</a>

            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 20px;">
              Dès votre inscription, vous recevrez le lien direct Google Meet et le lien pour rejoindre la communauté d'apprenants sur WhatsApp.
            </p>

            <p style="margin-top: 28px;">
              Au plaisir de vous retrouver en direct,<br>
              <strong>${instructor} & L'équipe Pédagogique LE GUIDE IA</strong>
            </p>
          </div>
          <div class="footer">
            Vous recevez cet email car vous êtes membre ou abonné de la plateforme Le Guide IA.<br>
            © 2026 LE GUIDE IA — Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `Bonjour ${firstName},\n\nNous vous invitons à notre prochaine Masterclass IA en Direct :\n\n${sessionTitle}\nDate : ${dateFormatted}\nIntervenant : ${instructor}\n\nRéservez votre place gratuite : ${registerUrl}\n\nÀ très vite,\n${instructor}`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject,
      text: textContent,
      html: htmlContent
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending platform masterclass invitation email:', error)
    return { success: false, error }
  }
}

export interface B2BQuoteEmailParams {
  companyName: string
  contactName: string
  email: string
  phone?: string
  serviceType?: string
  companySize?: string
  message?: string
}

export async function sendB2BConfirmationEmail(params: B2BQuoteEmailParams) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const { companyName, contactName, email, phone, serviceType = "Formation & Audit IA", companySize = "10-50", message } = params
    const firstName = contactName ? contactName.split(' ')[0] : 'Monsieur / Madame'

    const subject = `Confirmation de votre demande de devis B2B — LE GUIDE IA (${companyName})`
    const textContent = `Bonjour ${firstName},\n\nNous confirmons la bonne réception de votre demande de devis et accompagnement B2B pour ${companyName}.\n\nRécapitulatif de votre demande :\n- Entreprise : ${companyName}\n- Contact : ${contactName}\n- Téléphone / WhatsApp : ${phone || 'Non renseigné'}\n- Type de besoin : ${serviceType}\n- Effectif estimé : ${companySize} employés\n- Projet : ${message || 'Formation / Audit d\'équipe'}\n\nNotre équipe et Alfred Dah (Auditeur & Expert IA) analysent votre besoin et vous recontacteront avec une proposition sur-mesure sous 24 heures ouvrées.\n\nEn cas d'urgence, vous pouvez également nous joindre directement sur WhatsApp au +226 0505 0577 ou par email à alfred@leguideai.com.\n\nCordialement,\nAlfred Dah & L'équipe Entreprises LE GUIDE IA`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 20px auto; background-color: #0d1322; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 2px solid #D4AF37; padding: 32px 24px; text-align: center; }
          .logo-text { font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin: 0; }
          .badge { display: inline-block; background-color: rgba(212, 175, 55, 0.15); border: 1px solid #D4AF37; color: #ECC86B; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-top: 10px; }
          .content { padding: 32px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
          .recap-box { background-color: #131b2e; border: 1px solid #334155; border-left: 4px solid #D4AF37; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .recap-item { margin-bottom: 8px; font-size: 13px; }
          .recap-label { color: #94a3b8; font-weight: 600; }
          .recap-value { color: #f8fafc; font-weight: 700; }
          .cta-wa { display: block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 24px; border-radius: 12px; text-align: center; margin: 24px 0 12px 0; font-size: 14px; }
          .footer { background-color: #090d16; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1 class="logo-text">LE GUIDE IA</h1>
            <span class="badge">SOLUTIONS ENTREPRISES & INSTITUTIONS</span>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #f8fafc;">Bonjour <strong>${firstName}</strong>,</p>
            <p>Nous vous remercions pour votre intérêt envers les programmes d'accompagnement et de formation de <strong>LE GUIDE IA</strong>.</p>
            <p>Votre demande de devis sur-mesure pour <strong>${companyName}</strong> a bien été enregistrée avec succès.</p>

            <div class="recap-box">
              <div style="font-size: 13px; font-weight: 800; color: #ECC86B; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
                📋 Récapitulatif de votre besoin B2B
              </div>
              <div class="recap-item"><span class="recap-label">🏢 Entreprise :</span> <span class="recap-value">${companyName}</span></div>
              <div class="recap-item"><span class="recap-label">👤 Responsable :</span> <span class="recap-value">${contactName}</span></div>
              <div class="recap-item"><span class="recap-label">📧 Email :</span> <span class="recap-value">${email}</span></div>
              ${phone ? `<div class="recap-item"><span class="recap-label">📞 Téléphone :</span> <span class="recap-value">${phone}</span></div>` : ''}
              <div class="recap-item"><span class="recap-label">🎯 Service souhaité :</span> <span class="recap-value">${serviceType}</span></div>
              <div class="recap-item"><span class="recap-label">👥 Effectif concerné :</span> <span class="recap-value">${companySize} personnes</span></div>
              ${message ? `<div class="recap-item" style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #334155;"><span class="recap-label">📝 Message / Objectifs :</span><br><span style="color: #e2e8f0; font-style: italic;">« ${message} »</span></div>` : ''}
            </div>

            <div style="background-color: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <strong style="color: #ECC86B;">⏱️ Traitement sous 24h ouvrées</strong><br>
              <span style="font-size: 13px; color: #cbd5e1;">Notre équipe pédagogique et Alfred Dah (Auditeur certifié & Fondateur) préparent un programme personnalisé adapté à vos objectifs métiers. Vous recevrez une proposition détaillée très rapidement.</span>
            </div>

            <p style="font-size: 13px; color: #94a3b8;">
              Un besoin urgent ? Contactez directement notre pôle B2B sur WhatsApp :
            </p>
            <a href="https://wa.me/22605050577?text=${encodeURIComponent(`Bonjour Alfred, je viens d'envoyer une demande de devis B2B pour l'entreprise ${companyName}.`)}" class="cta-wa">
              💬 Échanger avec l'équipe B2B sur WhatsApp
            </a>

            <p style="margin-top: 24px;">
              Bien cordialement,<br>
              <strong>Alfred Dah & L'équipe Entreprises LE GUIDE IA</strong><br>
              <span style="font-size: 12px; color: #64748b;">alfred@leguideai.com • +226 0505 0577</span>
            </p>
          </div>
          <div class="footer">
            © 2026 LE GUIDE IA — Solutions IA & Gouvernance pour Entreprises et Cadres Dirigeants.
          </div>
        </div>
      </body>
      </html>
    `

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject,
      text: textContent,
      html: htmlContent
    })

    // Also notify internal admin email
    try {
      await resend.emails.send({
        from: fromEmail,
        to: 'alfred@leguideai.com',
        subject: `🔔 Nouvelle demande de devis B2B : ${companyName} (${contactName})`,
        text: `Nouvelle demande de devis B2B reçue :\n- Entreprise : ${companyName}\n- Contact : ${contactName}\n- Email : ${email}\n- Téléphone : ${phone || 'N/A'}\n- Service : ${serviceType}\n- Effectif : ${companySize}\n- Message : ${message || 'N/A'}`,
        html: `<div style="font-family: sans-serif; padding: 20px;"><h2>Nouvelle demande de devis B2B</h2><p><strong>Entreprise :</strong> ${companyName}</p><p><strong>Contact :</strong> ${contactName} (${email} / ${phone})</p><p><strong>Service :</strong> ${serviceType} (Effectif: ${companySize})</p><p><strong>Message :</strong> ${message || 'N/A'}</p></div>`
      })
    } catch (adminErr) {
      console.warn("Could not notify admin for B2B request:", adminErr)
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error sending B2B confirmation email:', error)
    return { success: false, error }
  }
}

export async function forwardB2BQuoteToAlfred(params: B2BQuoteEmailParams & { customNote?: string }) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const { companyName, contactName, email, phone, serviceType = "Formation & Audit IA", companySize = "10-50", message, customNote } = params

    const subject = `📥 [DEVIS B2B] Nouvelle demande transmise : ${companyName} (${contactName})`
    const textContent = `Bonjour Alfred,\n\nUne demande de devis B2B a été transmise depuis le Dashboard d'administration :\n\n- Entreprise : ${companyName}\n- Contact : ${contactName}\n- Email : ${email}\n- Téléphone / WhatsApp : ${phone || 'Non renseigné'}\n- Service souhaité : ${serviceType}\n- Effectif estimé : ${companySize}\n- Message / Besoins : ${message || 'Non renseigné'}\n${customNote ? `\nNote : ${customNote}\n` : ''}\nLien Admin : https://leguideai.com/admin\n\nÀ très vite,\nConsole Admin Le Guide IA`

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 0; }
          .wrapper { max-width: 600px; margin: 20px auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
          .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 2px solid #D4AF37; padding: 24px; text-align: center; }
          .badge { display: inline-block; background-color: rgba(212, 175, 55, 0.15); border: 1px solid #D4AF37; color: #ECC86B; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 9999px; }
          .content { padding: 28px 24px; font-size: 14px; line-height: 1.6; color: #e2e8f0; }
          .card { background-color: #0f172a; border: 1px solid #334155; border-left: 4px solid #3b82f6; border-radius: 10px; padding: 18px; margin: 20px 0; }
          .item { margin-bottom: 8px; font-size: 13px; }
          .label { color: #94a3b8; font-weight: 600; width: 140px; display: inline-block; }
          .value { color: #f8fafc; font-weight: 700; }
          .btn-reply { display: inline-block; background-color: #3b82f6; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 8px; margin-right: 10px; margin-top: 15px; }
          .btn-wa { display: inline-block; background-color: #10b981; color: #ffffff !important; font-weight: 700; text-decoration: none; padding: 10px 20px; border-radius: 8px; margin-top: 15px; }
          .footer { background-color: #0b0f19; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h2 style="margin: 0 0 6px 0; color: #ffffff; font-size: 20px;">Opportunité Devis B2B transmise</h2>
            <span class="badge">Transfert Admin vers Alfred Dah</span>
          </div>
          <div class="content">
            <p>Bonjour <strong>Alfred</strong>,</p>
            <p>Une demande de devis B2B a été transmise depuis le Dashboard d'administration.</p>
            
            <div class="card">
              <div style="font-weight: 800; color: #60a5fa; font-size: 13px; text-transform: uppercase; margin-bottom: 12px;">
                🏢 Détails de l'entreprise &amp; du lead
              </div>
              <div class="item"><span class="label">Entreprise :</span> <span class="value">${companyName}</span></div>
              <div class="item"><span class="label">Responsable :</span> <span class="value">${contactName}</span></div>
              <div class="item"><span class="label">Email :</span> <span class="value"><a href="mailto:${email}" style="color: #60a5fa;">${email}</a></span></div>
              <div class="item"><span class="label">Téléphone :</span> <span class="value">${phone || 'Non renseigné'}</span></div>
              <div class="item"><span class="label">Service souhaité :</span> <span class="value">${serviceType}</span></div>
              <div class="item"><span class="label">Effectif estimé :</span> <span class="value">${companySize}</span></div>
              ${message ? `<div class="item" style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #334155;"><span class="label">Message / Besoin :</span><br><span style="color: #cbd5e1; font-style: italic;">« ${message} »</span></div>` : ''}
            </div>

            <div style="text-align: center; margin-top: 20px;">
              <a href="mailto:${email}?subject=${encodeURIComponent(`Proposition de Devis B2B — ${companyName}`)}" class="btn-reply">
                ✉️ Répondre par Email au prospect
              </a>
              ${phone ? `<a href="https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${contactName}, je suis Alfred Dah de LE GUIDE IA suite à votre demande de devis pour ${companyName}.`)}" class="btn-wa">💬 Contacter sur WhatsApp</a>` : ''}
            </div>
          </div>
          <div class="footer">
            LE GUIDE IA — Notification Admin Automatique • Destinataire : alfred@leguideai.com
          </div>
        </div>
      </body>
      </html>
    `

    const data = await resend.emails.send({
      from: fromEmail,
      to: 'alfred@leguideai.com',
      replyTo: email,
      subject,
      text: textContent,
      html: htmlContent
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error forwarding B2B quote to Alfred:', error)
    return { success: false, error }
  }
}

export async function sendMasterclassTargetedEmail(params: {
  name: string
  email: string
  subject: string
  emailType: "reminder" | "replay" | "custom"
  customMessage: string
  session: {
    title: string
    description?: string
    scheduledAt?: string
    dateDisplay?: string
    instructor?: string
    thumbnailUrl?: string
    whatsappGroupUrl?: string
    youtubeLiveUrl?: string
  }
}) {
  try {
    const resend = getResendClient()
    if (!resend) {
      console.warn('Skipping email send: RESEND_API_KEY is not set')
      return { success: false, error: 'RESEND_API_KEY_MISSING' }
    }

    const { name, email, subject, emailType, customMessage, session } = params
    const firstName = (name && name !== "Apprenant") ? name.split(' ')[0] : 'Apprenant'
    const sessionTitle = session.title || "Masterclass IA en Direct"
    const instructor = session.instructor || "Alfred Dah"
    const dateFormatted = session.dateDisplay || (session.scheduledAt ? new Date(session.scheduledAt).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "")
    const youtubeUrl = session.youtubeLiveUrl || "https://meet.google.com"
    const whatsappUrl = session.whatsappGroupUrl || "https://chat.whatsapp.com"

    let badgeText = "📢 MESSAGE DE L'INSTRUCTEUR"
    let badgeColor = "#3b82f6"
    if (emailType === "reminder") {
      badgeText = "⏰ RAPPEL DE VOTRE MASTERCLASS"
      badgeColor = "#10b981"
    } else if (emailType === "replay") {
      badgeText = "📼 REPLAY & RESSOURCES DISPONIBLES"
      badgeColor = "#8b5cf6"
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 24px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
          .header { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-bottom: 2px solid #D4AF37; padding: 28px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-transform: uppercase; }
          .badge { display: inline-block; background-color: rgba(59, 130, 246, 0.15); border: 1px solid ${badgeColor}; color: ${badgeColor}; font-weight: 800; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 14px; }
          .content { padding: 30px 24px; line-height: 1.65; font-size: 14px; color: #cbd5e1; }
          .msg-box { background-color: #1f2937; border: 1px solid #374151; border-left: 4px solid #3b82f6; border-radius: 12px; padding: 18px; margin: 20px 0; color: #f9fafb; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          .info-card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 14px; padding: 18px; margin: 20px 0; font-size: 13px; }
          .btn-meet { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 13px; margin: 6px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }
          .btn-wa { display: inline-block; background-color: #16a34a; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 13px; margin: 6px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3); }
          .footer { background-color: #0b0f19; padding: 20px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #1f2937; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LE GUIDE IA</h1>
          </div>
          <div class="content">
            <span class="badge" style="color: ${badgeColor}; border-color: ${badgeColor};">${badgeText}</span>
            <p style="font-size: 17px; font-weight: 800; color: #ffffff; margin-top: 0;">Bonjour ${firstName} 👋,</p>
            
            ${customMessage ? `<div class="msg-box">${customMessage}</div>` : ''}

            <div class="info-card">
              <strong style="color: #60a5fa; font-size: 14px; display: block; margin-bottom: 8px;">🎯 Masterclass : ${sessionTitle}</strong>
              ${dateFormatted ? `📅 <strong>Date :</strong> ${dateFormatted}<br>` : ''}
              👨‍🏫 <strong>Formateur :</strong> ${instructor}<br>
              💻 <strong>Diffusion :</strong> Google Meet (Direct)
            </div>

            <div style="text-align: center; margin: 24px 0 16px;">
              ${youtubeUrl ? `<a href="${youtubeUrl}" class="btn-meet" target="_blank">🎥 Accéder à Google Meet</a>` : ''}
              ${whatsappUrl ? `<a href="${whatsappUrl}" class="btn-wa" target="_blank">💬 Groupe WhatsApp des Apprenants</a>` : ''}
            </div>

            <p style="margin-top: 28px; font-size: 13px;">
              Bien cordialement,<br>
              <strong>${instructor} & L'équipe LE GUIDE IA</strong>
            </p>
          </div>
          <div class="footer">
            Cet email vous est adressé en tant qu'inscrit à la Masterclass « ${sessionTitle} ».<br>
            © 2026 LE GUIDE IA — Tous droits réservés.
          </div>
        </div>
      </body>
      </html>
    `

    const textContent = `Bonjour ${firstName},\n\nConcernant la Masterclass : ${sessionTitle}\n\n${customMessage}\n\nLien Google Meet : ${youtubeUrl}\nGroupe WhatsApp : ${whatsappUrl}\n\nBien cordialement,\n${instructor}`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject,
      text: textContent,
      html: htmlContent
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending targeted masterclass email:', error)
    return { success: false, error }
  }
}

// =========================================================================
// 8. NOTIFICATIONS D'ABONNEMENT REPLAYS & PROMPTS VIP
// =========================================================================

export interface AdminNewSubscriptionParams {
  fullName: string
  email: string
  whatsapp?: string
  country?: string
  planLabel: string
  amount: number | string
  paymentMethod: string
  transactionRef: string
  receiptUrl?: string
  isAutoActivated?: boolean
}

export async function sendAdminNewSubscriptionNotification(params: AdminNewSubscriptionParams) {
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
      planLabel,
      amount = "10 000 FCFA",
      paymentMethod = "Mobile Money Direct",
      transactionRef = "Non spécifiée",
      receiptUrl,
      isAutoActivated = false
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

    const subject = isAutoActivated 
      ? `💎 [Nouvel Abonné Activé] ${fullName} — ${planLabel}`
      : `🔔 [Nouvel Abonnement à Valider] ${fullName} — ${planLabel}`

    const textContent = `💎 NOUVEL ABONNEMENT REPLAYS & PROMPTS ${isAutoActivated ? 'ACTIVÉ' : 'À VALIDER'} !\n\nSouscripteur : ${fullName}\nEmail : ${email}\nWhatsApp : ${whatsapp || 'N/A'}\nPays : ${country || 'N/A'}\nFormule : ${planLabel}\nMontant : ${formattedAmount}\nMéthode : ${paymentMethod}\nRéférence : ${transactionRef}\nStatut : ${isAutoActivated ? 'Actif (Stripe/Auto)' : 'En attente de validation (Mobile Money)'}\nPreuve : ${receiptUrl || 'Aucune capture'}\n\nAccédez au portail admin pour gérer les abonnements : ${adminUrl}`

    const data = await resend.emails.send({
      from: fromEmail,
      to: targetAdmins,
      replyTo: email,
      subject,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Notification Abonnement VIP</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 28px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 900; color: #ffffff; text-transform: uppercase; letter-spacing: -0.5px; }
            .header p { margin: 4px 0 0; font-size: 13px; color: #e0e7ff; }
            .content { padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; }
            .badge-pending { background-color: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
            .badge-active { background-color: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); }
            .info-table { width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #1e293b; border-radius: 12px; overflow: hidden; }
            .info-table td { padding: 12px 16px; border-bottom: 1px solid #334155; font-size: 13px; }
            .info-table tr:last-child td { border-bottom: none; }
            .label { color: #94a3b8; font-weight: 600; width: 40%; }
            .value { color: #ffffff; font-weight: 700; }
            .btn { display: inline-block; background: #2563eb; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-align: center; font-size: 14px; margin: 20px 0 10px; }
            .footer { background-color: #0b0f19; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💎 Abonnement Replays &amp; Prompts</h1>
              <p>${isAutoActivated ? 'Nouvelle souscription activée automatiquement' : 'Paiement Mobile Money en attente de vérification'}</p>
            </div>
            <div class="content">
              <span class="badge ${isAutoActivated ? 'badge-active' : 'badge-pending'}">
                ${isAutoActivated ? '✓ Accès Immédiatement Activé' : '⏳ Validation Requise'}
              </span>
              <p style="margin-top: 4px; font-size: 15px; color: #ffffff;">
                Un participant vient de souscrire à l'abonnement <strong>${planLabel}</strong>.
              </p>

              <table class="info-table">
                <tr>
                  <td class="label">👤 Souscripteur</td>
                  <td class="value">${fullName}</td>
                </tr>
                <tr>
                  <td class="label">📧 Email</td>
                  <td class="value"><a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td class="label">📱 WhatsApp</td>
                  <td class="value">
                    ${whatsapp ? `<a href="https://wa.me/${cleanPhone}" style="color: #34d399; text-decoration: none;">${whatsapp} 💬</a>` : 'Non renseigné'}
                  </td>
                </tr>
                <tr>
                  <td class="label">🌍 Pays</td>
                  <td class="value">${country || 'Non renseigné'}</td>
                </tr>
                <tr>
                  <td class="label">🎯 Formule</td>
                  <td class="value" style="color: #a78bfa;">${planLabel}</td>
                </tr>
                <tr>
                  <td class="label">💰 Montant</td>
                  <td class="value" style="color: #34d399; font-size: 15px;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td class="label">💳 Méthode</td>
                  <td class="value">${paymentMethod}</td>
                </tr>
                <tr>
                  <td class="label">🔢 Réf. Transaction</td>
                  <td class="value" style="font-family: monospace; color: #fbbf24;">${transactionRef}</td>
                </tr>
                ${receiptUrl ? `
                <tr>
                  <td class="label">🧾 Reçu de Paiement</td>
                  <td class="value">
                    <a href="${receiptUrl}" target="_blank" style="color: #60a5fa; text-decoration: underline; font-weight: 700;">Voir la capture du reçu 🔍</a>
                  </td>
                </tr>` : ''}
              </table>

              <div style="text-align: center;">
                <a href="${adminUrl}" class="btn">Accéder au Panneau d'Administration</a>
              </div>
            </div>
            <div class="footer">
              Système de Notification LE GUIDE IA • Alfred Dah
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending admin subscription notification:', error)
    return { success: false, error }
  }
}

export async function sendSubscriptionPendingEmail(name: string, email: string, planLabel: string, amount: number | string, paymentMethod: string) {
  try {
    const resend = getResendClient()
    if (!resend) return { success: false, error: 'RESEND_API_KEY_MISSING' }

    const firstName = name.split(' ')[0]
    const formattedAmount = typeof amount === "number" ? `${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA` : String(amount)

    const textContent = `Bonjour ${firstName},\n\nNous avons bien reçu votre demande de souscription à l'abonnement VIP LE GUIDE IA (${planLabel}).\nMontant : ${formattedAmount}\nMoyen de paiement : ${paymentMethod}\n\nVotre accès sera activé par notre équipe dès vérification de votre transaction (sous 2 à 4 heures max).\n\nDès validation, vous recevrez un email de confirmation et vos accès aux Replays Masterclasses et à la Bibliothèque de Prompts seront débloqués dans votre Espace Membre : https://leguideai.com/dashboard\n\nMerci pour votre confiance,\nL'équipe LE GUIDE IA & Alfred Dah`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject: `⏳ Votre demande d'abonnement ${planLabel} est en cours de validation — LE GUIDE IA`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; }
            .content { padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .box { background-color: #1e293b; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .footer { background-color: #0b0f19; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>LE GUIDE IA</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; font-weight: 700; color: #ffffff;">Bonjour ${firstName} 👋,</p>
              <p>Nous avons bien reçu votre demande de souscription pour le <strong>${planLabel}</strong>.</p>
              
              <div class="box">
                <strong style="color: #fbbf24;">⏳ Statut : En cours de validation</strong><br>
                💰 <strong>Montant :</strong> ${formattedAmount}<br>
                💳 <strong>Moyen de paiement :</strong> ${paymentMethod}<br>
                ⏱️ <strong>Délai moyen :</strong> Validation sous 2h à 4h par notre équipe
              </div>

              <p>Dès confirmation de votre transaction, vos accès complets aux <strong>Replays Masterclasses HD</strong> et à la <strong>Bibliothèque de Prompts IA</strong> seront instantanément débloqués sur votre compte.</p>
              
              <p>Vous pouvez consulter l'état de votre abonnement à tout moment dans votre Espace Membre :</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="https://leguideai.com/dashboard" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; display: inline-block;">Accéder à mon Espace Membre</a>
              </p>

              <p>Si vous avez la moindre question, écrivez-nous directement à <a href="mailto:alfred@leguideai.com" style="color: #60a5fa;">alfred@leguideai.com</a> ou sur WhatsApp.</p>
              <p>À très bientôt,<br><strong>Alfred Dah & L'équipe LE GUIDE IA</strong></p>
            </div>
            <div class="footer">
              © 2026 LE GUIDE IA — Tous droits réservés.
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending subscription pending email:', error)
    return { success: false, error }
  }
}

export async function sendSubscriptionActivatedEmail(name: string, email: string, planLabel: string, expiresAt: string, isRenewal: boolean = false) {
  try {
    const resend = getResendClient()
    if (!resend) return { success: false, error: 'RESEND_API_KEY_MISSING' }

    const firstName = name.split(' ')[0]
    const formattedDate = new Date(expiresAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })

    const textContent = `Bonjour ${firstName},\n\n🎉 Félicitations ! Votre abonnement VIP LE GUIDE IA (${planLabel}) est désormais ACTIF.\nDate de validité : Jusqu'au ${formattedDate}\n\nCe qui est désormais débloqué sur votre compte :\n✓ Accès illimité à tous les Replays des Masterclasses en HD\n✓ Accès complet à la Bibliothèque de Prompts IA & Modèles Business Plans\n✓ Nouveautés et mises à jour continues\n\nAccédez à vos contenus dès maintenant : https://leguideai.com/dashboard\n\nExcellente formation,\nAlfred Dah & L'équipe LE GUIDE IA`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject: `🎉 Votre abonnement VIP ${planLabel} est activé ! — LE GUIDE IA`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; }
            .content { padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .box { background-color: #064e3b/30; border: 1px solid #059669; border-radius: 12px; padding: 18px; margin: 20px 0; }
            .feature-list { list-style: none; padding: 0; margin: 16px 0; }
            .feature-list li { padding: 6px 0; color: #e2e8f0; font-size: 13px; }
            .btn { display: inline-block; background-color: #10b981; color: #022c22 !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-align: center; }
            .footer { background-color: #0b0f19; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💎 ACCÈS VIP ACTIVÉ</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; font-weight: 700; color: #ffffff;">Félicitations ${firstName} 🚀 !</p>
              <p>Votre abonnement <strong>${planLabel}</strong> est désormais <strong>actif et validé</strong>.</p>
              
              <div class="box">
                <strong style="color: #34d399; font-size: 15px;">✓ Vos privilèges VIP sont débloqués :</strong>
                <ul class="feature-list">
                  <li>📺 <strong>Replays Masterclasses HD :</strong> Visionnage illimité de toutes les sessions passées et futures</li>
                  <li>⚡ <strong>Bibliothèque de Prompts IA :</strong> Copie et téléchargement de tous les prompts avancés & templates</li>
                  <li>📅 <strong>Validité :</strong> Jusqu'au <strong style="color: #ffffff;">${formattedDate}</strong></li>
                </ul>
              </div>

              <div style="text-align: center; margin: 28px 0;">
                <a href="https://leguideai.com/dashboard" class="btn">Accéder à mes Contenus VIP</a>
              </div>

              <p>Si vous avez des questions ou besoin d'assistance, notre équipe reste à votre entière disposition.</p>
              <p>À très bientôt,<br><strong>Alfred Dah & L'équipe LE GUIDE IA</strong></p>
            </div>
            <div class="footer">
              © 2026 LE GUIDE IA — Tous droits réservés.
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending subscription activated email:', error)
    return { success: false, error }
  }
}

export async function sendSubscriptionExpiringSoonEmail(
  name: string,
  email: string,
  planLabel: string,
  expiresAt: string,
  daysRemaining: number
) {
  try {
    const resend = getResendClient()
    if (!resend) return { success: false, error: 'RESEND_API_KEY_MISSING' }

    const firstName = name.split(' ')[0]
    const formattedDate = new Date(expiresAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })

    const urgencyText = daysRemaining <= 1 
      ? "expire demain" 
      : `arrive à échéance dans ${daysRemaining} jours`

    const textContent = `Bonjour ${firstName},\n\n⏳ Votre abonnement VIP LE GUIDE IA (${planLabel}) ${urgencyText} (le ${formattedDate}).\n\nPour conserver vos accès ininterrompus à tous les Replays HD et à la bibliothèque de Prompts IA métier, vous pouvez renouveler votre Pass en 1 clic :\nhttps://leguideai.com/dashboard?tab=subscription\n\nExcellente continuation,\nAlfred Dah & L'équipe LE GUIDE IA`

    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: 'alfred@leguideai.com',
      subject: `⏳ Votre Pass VIP expire dans ${daysRemaining}j — Renouvelez vos accès LE GUIDE IA`,
      text: textContent,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); padding: 32px 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; }
            .content { padding: 28px 24px; line-height: 1.6; font-size: 14px; color: #cbd5e1; }
            .box { background-color: #78350f/20; border: 1px solid #d97706; border-radius: 12px; padding: 18px; margin: 20px 0; }
            .feature-list { list-style: none; padding: 0; margin: 16px 0; }
            .feature-list li { padding: 6px 0; color: #e2e8f0; font-size: 13px; }
            .btn { display: inline-block; background-color: #f59e0b; color: #451a03 !important; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-align: center; }
            .footer { background-color: #0b0f19; padding: 20px; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏳ RENOUVELLEMENT DE VOTRE PASS VIP</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; font-weight: 700; color: #ffffff;">Bonjour ${firstName} 👋,</p>
              <p>Votre abonnement <strong>${planLabel}</strong> <strong>${urgencyText}</strong> (le <strong>${formattedDate}</strong>).</p>
              
              <div class="box">
                <strong style="color: #fbbf24; font-size: 15px;">⚠️ Ne perdez pas vos accès exclusifs :</strong>
                <ul class="feature-list">
                  <li>📺 Visionnage illimité de tous les Replays Masterclasses HD</li>
                  <li>⚡ Copie et utilisation de tous les Prompts Métiers avancés</li>
                  <li>🚀 Mises à jour hebdomadaires des nouveaux outils et templates</li>
                </ul>
              </div>

              <p>Pour éviter toute interruption de vos accès, vous pouvez prolonger votre Pass VIP dès aujourd'hui (vos jours restants sont automatiquement cumulés) :</p>

              <div style="text-align: center; margin: 28px 0;">
                <a href="https://leguideai.com/dashboard?tab=subscription" class="btn">Renouveler mon Pass VIP en 1 Clic</a>
              </div>

              <p>Besoin d'assistance ? Répondez simplement à cet email ou contactez-nous directement sur WhatsApp.</p>
              <p>À très bientôt,<br><strong>Alfred Dah & L'équipe LE GUIDE IA</strong></p>
            </div>
            <div class="footer">
              © 2026 LE GUIDE IA — Tous droits réservés.
            </div>
          </div>
        </body>
        </html>
      `
    })

    return { success: true, data }
  } catch (error) {
    console.error('Error sending subscription expiring email:', error)
    return { success: false, error }
  }
}

