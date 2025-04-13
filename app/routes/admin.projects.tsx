import {useLoaderData} from 'react-router'
import ControlsProjects from '~/components/admin/controls-projects'
import {
  type Project,
  getProjectsDraft,
  getProjectsPublished,
} from '~/models/projects.server'

export const loader = async () => {
  const projectsDraft = await getProjectsDraft()
  const projectsPublished = await getProjectsPublished()
  return {projectsDraft, projectsPublished}
}

const DashboardProjects = () => {
  const {projectsDraft, projectsPublished} = useLoaderData<typeof loader>()

  return (
    <>
      <ControlsProjects />

      {projectsDraft && projectsDraft.length > 0 && (
        <>
          <p className="mt-4 ml-1.5 font-bold">draft</p>
          <div className="bg-content mt-1.5 px-3 py-1.5">
            {projectsDraft.map((project: Project) => {
              return (
                <div
                  key={project.title}
                  className="border-b px-1 py-2 last-of-type:border-0"
                >
                  <p>{project.title}</p>
                </div>
              )
            })}
          </div>
        </>
      )}

      {projectsPublished && projectsPublished.length > 0 && (
        <>
          <p className="mt-4 ml-1.5 font-bold">published</p>
          <div className="bg-content mt-1.5 px-3 py-1.5">
            {projectsPublished.map((project: Project) => {
              return (
                <div
                  key={project.title}
                  className="border-b px-1 py-2 last-of-type:border-0"
                >
                  <p>{project.title}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}

export default DashboardProjects
