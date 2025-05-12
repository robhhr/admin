import type {Project as ProjectProps} from '~/models/projects.server'

interface Props {
  data: ProjectProps
}

export const Project = ({data}: Props) => {
  return (
    <div className="border-b px-1 py-2 last-of-type:border-0">
      <p>{data.title}</p>
    </div>
  )
}
