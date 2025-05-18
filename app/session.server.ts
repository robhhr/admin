import {createCookie, createCookieSessionStorage} from 'react-router'

const Max_Age = 3600

type SessionData = {
  userId: string
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
  maxAge: Max_Age,
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
