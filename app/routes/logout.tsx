import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from 'react-router'
import {destroySession, getSession} from '~/session.server'
import {destroyValkeySession} from '~/valkey/valkey.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId') as string

  if (!userId) {
    return redirect('/login')
  }
}

export const action = async ({request}: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId') as string
  const sessionToken = session.get('sessionToken') as string

  if (!userId) {
    return redirect('/login')
  }

  await destroyValkeySession(sessionToken)

  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  })
}

export const Logout = () => {
  return null
}
