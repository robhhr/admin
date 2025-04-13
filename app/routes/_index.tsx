import {
  type LoaderFunctionArgs,
  type MetaFunction,
  redirect,
} from 'react-router'
import {LogoutButton} from '~/components/modules/logout-button'
import {isUserAuthenticated} from '~/models/auth.server'

export const meta: MetaFunction = () => {
  return [
    {title: 'admin-robhhr'},
    {name: 'description', content: 'admin-robhhr'},
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
