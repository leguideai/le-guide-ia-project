import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || 'Le Guide IA <onboarding@resend.dev>'

export async function sendRegistrationEmail(name: string, email: string) {
  try {
    const firstName = name.split(' ')[0]
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Confirmation de votre inscription au Bootcamp — LE GUIDE IA',
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
              © 2026 LE GUIDE IA — Tous droits réservés.
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
    const firstName = name.split(' ')[0]
    const data = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Confirmation de paiement reçu — LE GUIDE IA',
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
