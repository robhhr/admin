import {query} from 'db'
import {Secret, TOTP} from 'otpauth'
import * as QRCode from 'qrcode'

interface TOTPSecretRow {
  id: string
  user_id: string
  secret: string
  enabled: boolean
  created_at: Date
}

export function generateTOTPSecret(
  username: string,
  issuer: string = 'admin',
): {secret: string; otpauthURL: string} {
  const secret = new Secret({size: 20})

  const totp = new TOTP({
    issuer,
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  })

  return {
    secret: secret.base32,
    otpauthURL: totp.toString(),
  }
}

export function verifyTOTPCode(
  secret: string,
  token: string,
  window: number = 1,
): boolean {
  try {
    const totp = new TOTP({
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: Secret.fromBase32(secret),
    })

    const delta = totp.validate({
      token,
      window,
    })

    return delta !== null
  } catch (error) {
    console.error('error verifying TOTP code:', error)
    return false
  }
}

export async function generateQRCode(otpauthURL: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthURL)
  } catch (error) {
    console.error('error generating QR code:', error)
    throw new Error('failed to generate QR code')
  }
}

export async function saveTOTPSecret(
  userId: string,
  secret: string,
  enabled: boolean = true,
): Promise<void> {
  const sql = `
    INSERT INTO totp_secrets (user_id, secret, enabled, created_at)
    VALUES ($1, $2, $3, NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET secret = $2, enabled = $3
    RETURNING *;
  `
  const values = [userId, secret, enabled]
  try {
    await query(sql, values)
    console.log(`saved TOTP secret for user: ${userId}`)
  } catch (error) {
    console.error('error saving TOTP secret:', error)
    throw error
  }
}

export async function getTOTPSecret(userId: string): Promise<string | null> {
  const sql = `
    SELECT secret FROM totp_secrets
    WHERE user_id = $1 AND enabled = true
  `
  try {
    const results = await query<TOTPSecretRow>(sql, [userId])

    if (!results || results.length === 0) {
      return null
    }

    return results[0].secret
  } catch (error) {
    console.error('error fetching TOTP secret:', error)
    throw error
  }
}

export async function isTOTPEnabled(userId: string): Promise<boolean> {
  const sql = `
    SELECT enabled FROM totp_secrets
    WHERE user_id = $1
  `

  try {
    const results = await query<TOTPSecretRow>(sql, [userId])

    if (!results || results.length === 0) {
      return false
    }

    return results[0].enabled
  } catch (error) {
    console.error('error checking if TOTP is enabled:', error)
    return false
  }
}

export async function disableTOTP(userId: string): Promise<void> {
  const sql = `
    UPDATE totp_secrets
    SET enabled = false
    WHERE user_id = $1
  `

  try {
    await query(sql, [userId])
    console.log(`disabled TOTP for user: ${userId}`)
  } catch (error) {
    console.error('error disabling TOTP:', error)
    throw error
  }
}

export async function deleteTOTPSecret(userId: string): Promise<void> {
  const sql = `
    DELETE FROM totp_secrets
    WHERE user_id = $1
  `

  try {
    await query(sql, [userId])
    console.log(`deleted TOTP secret for user: ${userId}`)
  } catch (error) {
    console.error('error deleting TOTP secret:', error)
    throw error
  }
}
