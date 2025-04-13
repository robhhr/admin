import {redirect} from 'react-router'
import {query} from '../../db'
import bcrypt from 'bcryptjs'
import {commitSession, getSession} from '~/session.server'
import {valkeyClient} from '~/valkey/valkey.server'

interface User {
  id: string
  username: string
  password: string
  role_id: number
}

interface Print {
  userId: string
  fingerprint: string
  hash: string
  isActive: boolean
}

export async function login({
  username,
  password,
}: Omit<User, 'id' | 'role_id'>) {
  const result = await query<User>('SELECT * FROM users WHERE username = $1', [
    username,
  ])

  if (!result.length) {
    return
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    result[0].password ?? '',
  )

  if (!isPasswordValid) return

  return {
    id: result[0].id,
    username: result[0].username,
    password: result[0].password,
  }
}

export async function createUserSession(
  userId: string,
  authenticated: boolean,
  request: Request,
  remember: boolean = false,
  sessionToken?: string,
) {
  const session = await getSession(request.headers.get('Cookie'))
  session.set('userId', userId)
  session.set('authenticated', authenticated)
  session.set('remember', remember)

  if (sessionToken) {
    session.set('sessionToken', sessionToken)
  }

  // 30days vs 30min
  const maxAge = remember ? 30 * 24 * 60 * 60 : 1800

  return commitSession(session, {maxAge})
}

export async function isUserAuthenticated(request: Request) {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')
  const sessionToken = session.get('sessionToken')
  const authenticated = session.get('authenticated')

  if (!userId || !sessionToken || !authenticated) {
    return false
  }

  const sessionExpiresAt = session.expires
    ? new Date(session.expires).getTime()
    : null

  if (sessionExpiresAt && Date.now() > sessionExpiresAt) {
    return false
  }

  const valkeySession = await valkeyClient
    .get(`session:${sessionToken}`)
    .then(res => res && JSON.parse(res))
    .catch(() => null)

  if (!valkeySession || !valkeySession.is2FA) {
    return false
  }

  return true
}

export async function requireUser(request: Request): Promise<string> {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId') as string

  if (!userId) {
    throw redirect('/login')
  }

  return userId
}

export async function insertFingerprint({
  userId,
  fingerprint,
  hash,
  isActive,
}: Print): Promise<void> {
  const sql = `
    INSERT INTO fingerprints (
      user_id, 
      fingerprint, 
      hash, 
      is_active, 
      last_used_at
    )
    VALUES ($1, $2, $3, $4, current_timestamp)
    RETURNING id;
  `

  try {
    const result = await query<Print>(sql, [
      userId,
      fingerprint,
      hash,
      isActive,
    ])

    console.log(`inserted print record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error inserting print:', error)
    throw error
  }
}
