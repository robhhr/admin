import {Project} from './project'
import type {Project as ProjectProps} from '~/models/projects.server'

interface Props {
  data: ProjectProps[]
  title: string
}

export const ProjectListing = ({title, data}: Props) => {
  // console.log(data)
  return (
    <>
      <p className="mt-4 ml-1.5 font-bold">{title}</p>
      <div className="bg-content mt-1.5 px-3 py-1.5 dark:bg-background-admin-dark">
        {data.map(project => {
          return <Project data={project} key={project.title} />
        })}
      </div>
    </>
  )
}
