import {Link} from 'react-router'
import type {Project as ProjectProps} from '~/models/projects.server'

interface Props {
  data: ProjectProps
}

export const Project = ({data}: Props) => {
  return (
    <div className="flex justify-between border-b px-1 py-2 last-of-type:border-0">
      <p>{data.title}</p>

      <div>
        <Link
          className="text-edit hover:text-edit/65 transition-colors duration-100"
          to={`/admin/project/${data.id}`}
        >
          edit
        </Link>
        <span className="mx-1">•</span>
        <button className="text-delete hover:text-delete/65 transition-colors duration-100">
          delete
        </button>
      </div>
    </div>
  )
}
