import {type ActionFunctionArgs, useLoaderData} from 'react-router'
import {ControlsProjects, ProjectListing} from '~/components/admin'
import {archiveProject, getProjectsByStatus} from '~/models/projects.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = formData.get('intent')
  const projectId = formData.get('projectId') as string

  if (!projectId) return {error: 'project id required'}

  if (intent === 'archive') {
    await archiveProject({id: projectId})
  }
}

export const loader = async () => {
  const [projectsPublished, projectsDraft, projectsArchived] =
    await Promise.all([
      getProjectsByStatus({status: 'publish'}),
      getProjectsByStatus({status: 'draft'}),
      getProjectsByStatus({status: 'archive'}),
    ])

  return {projectsArchived, projectsDraft, projectsPublished}
}

const DashboardProjects = () => {
  const {projectsArchived, projectsDraft, projectsPublished} =
    useLoaderData<typeof loader>()

  return (
    <>
      <ControlsProjects />

      {projectsDraft && projectsDraft.length > 0 && (
        <ProjectListing title="draft" data={projectsDraft} />
      )}

      {projectsPublished && projectsPublished.length > 0 && (
        <ProjectListing title="published" data={projectsPublished} />
      )}

      {projectsArchived && projectsArchived.length > 0 && (
        <ProjectListing title="archived" data={projectsArchived} />
      )}
    </>
  )
}

export default DashboardProjects
