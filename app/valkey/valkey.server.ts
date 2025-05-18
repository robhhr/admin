// NOTE: used only when attempting to log into admin
import {randomUUID} from 'crypto'
import Valkey from 'iovalkey'
import {commitSession, getSession} from '~/session.server'

interface ValkeySession {
  userId: string
  username?: string
  fingerprint: string
  loginTime?: string
  is2FA?: boolean
  remember?: boolean
}

const EXPIRY_SECONDS = 1800 // 30min
const REFRESH_THRESHOLD = 5 * 60 * 1000 // 5min

export const valkeyClient = new Valkey({
  port: Number(process.env.REDIS_PORT) || 6380,
  host: process.env.REDIS_HOST || 'localhost',
  password: process.env.REDIS_PASS || 'svp3rs3cr3t',
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  family: 0,
})

export const createValkeySession = async ({
  userId,
  username,
  fingerprint,
  is2FA,
  remember = false,
}: ValkeySession) => {
  const sessionToken = randomUUID()
  const sessionData = {
    userId,
    username,
    fingerprint,
    loginTime: Date.now().toString(),
    is2FA: is2FA || false,
  }

  // NOTE: create valkey session
  try {
    await valkeyClient.set(
      `session:${sessionToken}`,
      JSON.stringify(sessionData),
      'EX',
      // 30 days vs 30min
      remember ? 30 * 24 * 60 * 60 : 1800,
    )
  } catch (error) {
    console.error('error creating redis session:', error)
  }

  return {sessionToken, sessionData}
}

export const checkValkeySession = async (userId: string) => {
  try {
    const keys = await valkeyClient.keys('session:*')

    for (const key of keys) {
      const sessionData = await valkeyClient.get(key)

      if (sessionData) {
        const session = JSON.parse(sessionData)

        if (session.userId === userId) {
          console.log('matching session found:', session)
          return session
        }
      }
    }

    console.log('no matching session found for userId:', userId)
    return null
  } catch (error) {
    console.error('error checking redis session:', error)
    return null
  }
}

export const destroyValkeySession = async (sessionToken: string) => {
  try {
    await valkeyClient.del(`session:${sessionToken}`)
  } catch (error) {
    console.error('error destroying redis session:', error)
  }
}

export async function refreshSessionTTL(request: Request) {
  const session = await getSession(request.headers.get('Cookie'))
  const sessionToken = session.get('sessionToken')
  const remember = session.get('remember')
  const expiresAt = session.get('expiresAt')

  if (!sessionToken || remember || !expiresAt) return null

  const expiresIn = expiresAt - Date.now()
  // close to expiry; refresh
  if (expiresIn < REFRESH_THRESHOLD) {
    const newExpiresAt = Date.now() + EXPIRY_SECONDS * 1000

    session.set('expiresAt', newExpiresAt)

    await valkeyClient.expire(`session:${sessionToken}`, EXPIRY_SECONDS)

    return commitSession(session, {maxAge: EXPIRY_SECONDS})
  }

  return null
}
