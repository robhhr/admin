import {query} from '../../db'
import bcrypt from 'bcryptjs'

interface AuthCodeProps {
  id: string
  user_id: string
  hashed_code: string
  created_at: Date
  expired: boolean
}

export async function insertTwoFactorCode(userId: string, hashedCode: string) {
  const sql = `
    INSERT INTO two_factor_codes (user_id, hashed_code, created_at, expired)
    VALUES ($1, $2, NOW(), false)
    RETURNING *;
  `
  const values = [userId, hashedCode]

  try {
    const twoFAcode = await query(sql, values)
    console.log(`inserted two-factor code: ${JSON.stringify(twoFAcode)}`)
  } catch (error) {
    console.error('error inserting two-factor code:', error)
    throw error
  }
}

export async function checkIfCodeMatches({
  userId,
  code,
}: {
  userId: string
  code: string
}): Promise<boolean> {
  const sql = `
    SELECT * FROM two_factor_codes 
    WHERE user_id = $1 
      AND created_at >= NOW() - INTERVAL '15 minutes'
      AND expired = false
  `

  try {
    const results = await query<AuthCodeProps>(sql, [userId])

    if (!results || !results.length) {
      return false
    }

    for (const result of results) {
      const matches = await bcrypt.compare(code, result.hashed_code ?? '');

      if (matches) {
        await query(
          `UPDATE two_factor_codes SET expired = true WHERE id = $1`,
          [result.id]
        );

        return true;
      }
    }

    return false
  } catch (error) {
    console.error('error checking if code matches', error)
    throw new Error(
      `query failed for code w/ userId: ${userId}. error: ${JSON.stringify(error)}`,
    )
  }
}

