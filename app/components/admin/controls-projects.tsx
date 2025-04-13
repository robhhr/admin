import {useLocation} from 'react-router'
import {Button} from '../modules/button'

const ControlsProjects = () => {
  const location = useLocation()

  return (
    <ul className="flex">
      <li className="mr-2">
        <Button
          disabled={location.pathname === '/admin/projects'}
          to="/admin/projects"
        >
          view all
        </Button>
      </li>
      <li>
        <Button
          disabled={location.pathname === '/admin/projects/create'}
          to="/admin/projects/create"
        >
          create project
        </Button>
      </li>
    </ul>
  )
}

export default ControlsProjects
