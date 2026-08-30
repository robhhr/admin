import {createCookie, createCookieSessionStorage} from 'react-router'

export const SESSION_MAX_AGE = {
  standard: 30 * 60,
  remembered: 30 * 24 * 60 * 60,
} as const

export function getSessionMaxAge(remember: boolean): number {
  return remember ? SESSION_MAX_AGE.remembered : SESSION_MAX_AGE.standard
}

type SessionData = {
  userId: string
  username?: string
  authenticated: boolean
  remember: boolean
  sessionToken?: string
  expiresAt?: number
}

type SessionFlashData = {
  error: string
}

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set in your environment variables')
}

export const sessionCookie = createCookie('_session', {
  httpOnly: true,
  maxAge: SESSION_MAX_AGE.standard,
  path: '/',
  sameSite: 'lax',
  secrets: ['s3cret1'],
  secure: process.env.NODE_ENV === 'production',
})

const {getSession, commitSession, destroySession} = createCookieSessionStorage<
  SessionData,
  SessionFlashData
>({
  cookie: sessionCookie,
})

export {getSession, commitSession, destroySession}
