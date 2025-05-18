import {LogoutButton} from './logout-button'
import {ToggleTheme} from './toggle-theme'

export const Sidebar = () => {
  return (
    <div className="bg-title-bar shadow-window absolute top-5 right-5 z-10 flex items-center justify-center px-2 py-1.5 xl:top-16 xl:right-40">
      <ToggleTheme />
      <LogoutButton />
    </div>
  )
}
