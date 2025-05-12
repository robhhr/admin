import {type LoaderFunctionArgs, Outlet, redirect} from 'react-router'
import {cx} from 'class-variance-authority'
import {Nav} from '~/components/admin/nav'
import {LogoutButton} from '~/components/modules/logout-button'
import {ToggleTheme} from '~/components/modules/toggle-theme'
import {isUserAuthenticated} from '~/models/auth.server'
import {refreshSessionTTL} from '~/valkey/valkey.server'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  return await refreshSessionTTL(request)
}

const AdminLayout = () => {
  return (
    <>
      <ToggleTheme />
      <LogoutButton />

      <div
        className={cx(
          'font-ms-sans-serif relative h-full min-h-screen text-xs',
          'bg-silver text-default',
          'dark:bg-background-admin-dark dark:text-color-dark',
        )}
      >
        <div className="mx-auto w-4/5 py-64">
          <Nav />

          <div
            className={cx(
              'min-w-[400px] px-2 py-4',
              'bg-silver shadow-window',
              'dark:bg-background-admin-dark',
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
