import nodemailer from 'nodemailer'
import { generateHashCode } from './code-gen'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_FROM_PASSWORD,
  },
})

export async function sendEmail(
  to: string,
  subject: string,
  text?: string,
  html?: string,
  cc?: string,
  bcc?: string,
) {
  const mailOptions = {
    from: `sroot <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
    cc,
    bcc,
  }

  if (process.env.NODE_ENV === 'production') {
    try {
      await transporter.sendMail(mailOptions)
      console.log('email sent to:', mailOptions.to)
      return 'success'
    } catch (error) {
      console.error('error sending email:', error)
      throw new Error('failed to send email')
    }
  } else {
    console.log(`DEBUG MAILER: ${JSON.stringify(mailOptions, null, 2)}`)
  }
}

export async function sendCodeEmail(code: string) {
  if (code && code.length > 0) {
    const subject = 'auth code request'
    const html = `code: ${code}`

    try {
      await sendEmail(process.env.EMAIL_TO ?? '', subject, undefined, html)
    } catch (error) {
      console.error('error sending email:', error)
      throw new Error('failed to send email')
    }
  }
} 

// export async function sendPasswordResetEmail(to: string, token: string) {
//   try {
//     const resetLink = `${process.env.BASE_URL}/login/reset-password?token=${token}`
//
//     await transporter.sendMail({
//       from: `${process.env.MAILCHIMP_EMAIL}`,
//       to: to,
//       subject: '',
//       text: ``,
//     })
//   } catch (error: any) {
//     console.error('Error sending email:', error.message)
//     throw new Error('Failed to send email')
//   }
// }

