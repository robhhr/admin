import {type ActionFunctionArgs, redirect, useLoaderData} from 'react-router'
import {ControlsPhotos, ProjectListing} from '~/components/admin'
import {isUserAuthenticated} from '~/models/auth.server'
import {
  type Project,
  archiveProject,
  getProjects,
  unarchiveProject,
} from '~/models/projects.server'
import {tryCatch} from '~/utils'

export const loader = async () => {
  const data = await tryCatch(getProjects())

  if (data.error) {
    console.error('error retrieving projects:', data.error)
    return {error: data.error}
  }

  const grouped = {
    projectsPublished: [] as Project[],
    projectsDraft: [] as Project[],
    projectsArchived: [] as Project[],
  }

  for (const project of data.data) {
    switch (project.status) {
      case 'publish':
        grouped.projectsPublished.push(project)
        break
      case 'draft':
        grouped.projectsDraft.push(project)
        break
      case 'archive':
        grouped.projectsArchived.push(project)
        break
    }
  }

  return {data: grouped, error: null}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  const projectId = formData.get('projectId') as string

  if (!projectId) return {error: 'project id required'}

  const performAction = async (
    action: (args: {id: string}) => Promise<unknown>,
    label: string,
  ) => {
    const result = await tryCatch(action({id: projectId}))

    if (result.error) {
      console.error(`error with ${label} project:`, result.error)
      return {error: `error with ${label} project`}
    }

    return {
      success: `project ${label}`,
      result,
    }
  }

  switch (intent) {
    case 'archive':
      return await performAction(archiveProject, 'archiving')

    case 'unarchive':
      return await performAction(unarchiveProject, 'unarchiving')

    default:
      return {error: 'invalid intent'}
  }
}

const DashboardProjects = () => {
  const {data} = useLoaderData<typeof loader>()

  return (
    <>
      <ControlsPhotos />
    </>
  )
}

export default DashboardProjects
