import {useLocation} from 'react-router'
import {Button} from '../modules/button'

export const ControlsPhotos = () => {
  const location = useLocation()

  return (
    <ul className="flex">
      <li className="mr-2">
        <Button
          disabled={location.pathname === '/admin/photos'}
          to="/admin/photos"
        >
          view all
        </Button>
      </li>
      <li>
        <Button
          disabled={location.pathname === '/admin/photos/create'}
          to="/admin/photos/create"
        >
          new collection
        </Button>
      </li>
    </ul>
  )
}
