import {LogoutButton} from './logout-button'
import {ToggleTheme} from './toggle-theme'

export const Sidebar = () => {
  return (
    <div className="bg-title-bar shadow-window absolute right-5 z-10 flex items-center justify-center px-2 py-1.5 top-5">
      <ToggleTheme />
      <LogoutButton />
    </div>
  )
}
