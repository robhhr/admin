import {query} from '../../db'

export async function checkIFingerprintExists({
  userId,
  hash
}: {
  userId: string
  hash: string
}): Promise<boolean> {
  const sql = `
    SELECT is_active
    FROM fingerprints 
    WHERE user_id = $1 AND hash = $2 AND is_active = true
    LIMIT 1;
  `

  try {
    const result = await query(sql, [userId, hash])

    if (!result || !result.length) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error checking if fingerprint exists', error)
    throw new Error(
      `Database query failed for userId: ${userId}. Error: ${JSON.stringify(error)}`,
    )
  }
}

