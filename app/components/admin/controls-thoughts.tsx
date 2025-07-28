import {useLocation} from 'react-router'
import {Button} from '../modules/button'

export const ControlsThoughts = () => {
  const location = useLocation()

  return (
    <ul className="flex flex-col">
      <div className="flex">
        <li className="mr-2">
          <Button
            disabled={location.pathname === '/admin/thoughts'}
            to="/admin/thoughts"
          >
            view all
          </Button>
        </li>
        <li>
          <Button
            disabled={location.pathname === '/admin/thoughts/create'}
            to="/admin/thoughts/create"
          >
            create
          </Button>
        </li>
      </div>
    </ul>
  )
}
