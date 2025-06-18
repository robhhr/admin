import {useLocation} from 'react-router'
import {Button} from '../modules/button'

export const ControlsNotes = () => {
  const location = useLocation()

  return (
    <ul className="flex flex-col">
      <div className="flex">
        <li className="mr-2">
          <Button
            disabled={location.pathname === '/admin/notes'}
            to="/admin/notes"
          >
            view all
          </Button>
        </li>
        <li>
          <Button
            disabled={location.pathname === '/admin/notes/create'}
            to="/admin/notes/create"
          >
            create
          </Button>
        </li>
      </div>
    </ul>
  )
}
