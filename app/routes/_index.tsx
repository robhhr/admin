import {type LoaderFunctionArgs, MetaFunction, redirect} from '@remix-run/node'
import {isUserAuthenticated} from '~/models/auth.server'
import {LogoutButton} from '~/components/modules/logout-button'

export const meta: MetaFunction = () => {
  return [
    {title: 'New Remix App'},
    {name: 'description', content: 'Welcome to Remix!'},
  ]
}

export const loader = async ({request}: LoaderFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  return redirect('/admin')
}

export default function Index() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <p className="font-ms-sans-serif">hello there</p>
      </div>

      <LogoutButton />
    </div>
  )
}
