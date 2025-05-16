import {type ActionFunctionArgs, redirect, useLoaderData} from 'react-router'
import {ControlsProjects, ProjectListing} from '~/components/admin'
import {isUserAuthenticated} from '~/models/auth.server'
import {
  archiveProject,
  getProjectsByStatus,
  unarchiveProject,
} from '~/models/projects.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  const projectId = formData.get('projectId') as string

  if (!projectId) return {error: 'project id required'}

  switch (intent) {
    case 'archive':
      try {
        const result = await archiveProject({id: projectId})
        return {
          success: 'project archived',
          result,
        }
      } catch (error) {
        console.error('error archiving project:', error)
        return {error: 'error archiving project'}
      }

    case 'unarchive':
      try {
        const result = await unarchiveProject({id: projectId})
        return {
          success: 'project unarchived',
          result,
        }
      } catch (error) {
        console.error('error unarchiving project:', error)
        return {error: 'error unarchiving project'}
      }

    default:
      return {error: 'invalid intent'}
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
