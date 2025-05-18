import {type LoaderFunctionArgs, Outlet, data, redirect} from 'react-router'
import {cx} from 'class-variance-authority'
import {Nav} from '~/components/admin/nav'
import {Sidebar} from '~/components/modules'
import {isUserAuthenticated} from '~/models/auth.server'
import {refreshSessionTTL} from '~/valkey/valkey.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const setCookie = await refreshSessionTTL(request)

  return data(
    {ok: true},
    {
      headers: {
        ...(setCookie ? {'Set-Cookie': setCookie} : {}),
        'Cache-Control': 'no-store',
      },
    },
  )
}

const AdminLayout = () => {
  return (
    <>
      <Sidebar />

      <div
        className={cx(
          'font-ms-sans-serif relative flex h-full min-h-screen items-center justify-center text-xs',
          'bg-silver text-default',
          'dark:bg-background-dark dark:text-color-dark',
        )}
      >
        <div className="w-full max-w-[680px] p-5 py-20">
          <Nav />

          <div
            className={cx(
              'px-2 py-4 md:min-w-[400px]',
              'bg-silver shadow-window',
              'dark:bg-background-dark dark:shadow-window-dark',
            )}
          >
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminLayout
