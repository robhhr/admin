import {redirect} from 'react-router'
import {query} from '../../db'
import bcrypt from 'bcryptjs'
import {commitSession, getSession, getSessionMaxAge} from '~/session.server'
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
  username?: string,
) {
  const session = await getSession(request.headers.get('Cookie'))
  const now = Date.now()
  const maxAge = getSessionMaxAge(remember)
  const expiresAt = now + maxAge * 1000
  session.set('userId', userId)
  session.set('authenticated', authenticated)
  session.set('remember', remember)
  session.set('expiresAt', expiresAt)

  if (sessionToken) {
    session.set('sessionToken', sessionToken)
  }

  if (username) {
    session.set('username', username)
  }

  return commitSession(session, {maxAge})
}

export async function isUserAuthenticated(request: Request) {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')
  const sessionToken = session.get('sessionToken')
  const authenticated = session.get('authenticated')
  const sessionExpiresAt = session.get('expiresAt')

  if (!userId || !sessionToken || !authenticated) {
    return false
  }

  // console.log('Raw timestamp:', sessionExpiresAt)
  // console.log('Readable time:', new Date(sessionExpiresAt).toISOString())

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

export async function updatePassword({
  password,
}: {
  password: string
}): Promise<void> {
  const sql = `
    UPDATE users
    SET password = $1
    WHERE username = 'sroot'
  `

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await query<User>(sql, [hashedPassword])

    console.log(`updated password record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error updating password:', error)
    throw error
  }
}
