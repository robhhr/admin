import {useLoaderData} from 'react-router'
import {ControlsProjects, ProjectListing} from '~/components/admin'
import {getProjectsDraft, getProjectsPublished} from '~/models/projects.server'

export const loader = async () => {
  const [projectsPublished, projectsDraft] = await Promise.all([
    getProjectsPublished(),
    getProjectsDraft(),
  ])

  return {projectsDraft, projectsPublished}
}

const DashboardProjects = () => {
  const {projectsDraft, projectsPublished} = useLoaderData<typeof loader>()

  return (
    <>
      <ControlsProjects />

      {projectsDraft && projectsDraft.length > 0 && (
        <ProjectListing title="draft" data={projectsDraft} />
      )}

      {projectsPublished && projectsPublished.length > 0 && (
        <ProjectListing title="published" data={projectsPublished} />
      )}
    </>
  )
}

export default DashboardProjects
