import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
  redirect,
  useActionData,
} from 'react-router'
import useFingerprint from '~/hooks/useFingerprint'
import {CodeAuthForm, LoginForm} from '~/components/forms/admin'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {
  checkIfCodeMatches,
  insertTwoFactorCode,
} from '~/models/auth-codes.server'
import {
  createUserSession,
  insertFingerprint,
  isUserAuthenticated,
  login,
} from '~/models/auth.server'
import {checkIFingerprintExists} from '~/models/session.server'
import {commitSession, getSession} from '~/session.server'
import {generateHashCode, sendCodeEmail} from '~/utils'
import {createValkeySession} from '~/valkey/valkey.server'

enum AuthState {
  IDLE = 'idle',
  TWO_FACTOR = '2FA',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (isAuth) {
    return redirect('/admin')
  }

  return {}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const body = await request.formData()
  const action = body.get('action') as string
  const remember = body.get('remember') === 'true'
  const fingerprint = body.get('fingerprint') as string
  const fingerprintData = body.get('fingerprintData') as string

  switch (action) {
    case '2FA': {
      // #1 check form code & generate hashed code
      const code = body.get('code') as string

      if (!code) {
        return {error: 'add code'}
      }

      // #2 get user data from session (session created in case: 'login')
      const session = await getSession(request.headers.get('Cookie'))
      const userId = session.get('userId')

      if (!userId) {
        return {error: 'error with user'}
      }

      // #3 compare form code w/ hashed code in db
      try {
        const matches = await checkIfCodeMatches({userId, code})

        if (!matches) {
          return {error: 'invalid code'}
        }

        // #3.1 if match change cookie auth & insert browser data
        const {sessionToken} = await createValkeySession({
          userId,
          fingerprint,
          is2FA: true,
          remember,
        })

        session.set('authenticated', true)
        session.set('sessionToken', sessionToken)

        if (sessionToken) {
          await insertFingerprint({
            userId: userId,
            fingerprint: fingerprintData,
            hash: fingerprint,
            isActive: true,
          })

          return redirect('/admin/projects', {
            headers: {
              'Set-Cookie': await commitSession(session),
            },
          })
        } else {
          return {
            authState: AuthState.ERROR,
            error: 'error creating valkey session',
          }
        }
      } catch (error) {
        console.error('error verifying code:', error)
        return {
          authState: AuthState.ERROR,
          error: 'error verifying code',
        }
      }
    }

    case 'login': {
      const username = body.get('username') as string
      const password = body.get('password') as string

      if (!username || !password) {
        return {error: 'fill all fields'}
      }

      // #1 check db user password match
      const user = await login({username, password})

      if (!user) {
        return {error: 'invalid credentials'}
      }

      // #2 check if device exists for this user
      const exists = await checkIFingerprintExists({
        userId: user.id,
        hash: fingerprint,
      })

      // #2.1 if it doesnt, try to insert fingerprint, auth code & send email w/ auth code && render 2FA
      if (!exists) {
        const hashedCode = await generateHashCode()
        // insert cookie without authenticated flag
        const createSession = await createUserSession(
          user.id,
          false,
          request,
          remember,
        )

        try {
          await Promise.allSettled([
            insertTwoFactorCode(user.id, hashedCode.hash),
            sendCodeEmail(hashedCode.code),
          ])

          return data(
            {authState: AuthState.TWO_FACTOR, error: null},
            {
              headers: {
                'Set-Cookie': createSession,
                'Content-Type': 'application/json',
              },
            },
          )
        } catch (error) {
          console.error('error inserting log data:', error)
          return {error: 'error inserting log data'}
        }
      }

      // #3 if exists continue w/o 2FA
      try {
        // create valkey session with user db id
        const {sessionToken} = await createValkeySession({
          userId: user.id,
          username,
          fingerprint,
          is2FA: true,
          remember,
        })

        // create local session w/ valkey id on it
        const createSession = await createUserSession(
          user.id,
          true,
          request,
          remember,
          sessionToken,
        )

        return redirect('/admin/projects', {
          headers: {
            'Set-Cookie': createSession,
          },
        })
      } catch (error) {
        console.error('error main login', error)
      }

      break
    }

    default:
      return {authState: AuthState.IDLE}
  }
}

const Login = () => {
  const actionData = useActionData<typeof action>()
  const {fingerprint, generateFingerprint} = useFingerprint()
  const [remember, setRemember] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const toggleRemember = () => {
    setError(null)
    setRemember(!remember)
  }

  useEffect(() => {
    const fetchFingerprint = async () => {
      await generateFingerprint()
    }

    fetchFingerprint()
  }, [generateFingerprint])

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    }
  }, [actionData])

  const handleChange = () => setError(null)

  return (
    <div className="bg-silver relative mx-auto flex h-screen min-h-96 w-full items-center justify-center p-5">
      {actionData?.authState === AuthState.TWO_FACTOR ? (
        <CodeAuthForm fingerprint={fingerprint || undefined} />
      ) : (
        <LoginForm
          fingerprint={fingerprint || undefined}
          onChange={handleChange}
          toggleRemember={toggleRemember}
          remember={remember}
        />
      )}

      <FeedbackDialog actionData={error ? {error} : undefined} />
    </div>
  )
}

export default Login
