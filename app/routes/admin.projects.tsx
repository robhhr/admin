import {type ActionFunctionArgs, redirect, useLoaderData} from 'react-router'
import {ControlsProjects, ProjectListing} from '~/components/admin'
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

  switch (intent) {
    case 'archive':
      try {
        const result = await tryCatch(archiveProject({id: projectId}))

        if (result.error) {
          console.error('error archiving project:', result.error)
          return {error: 'error archiving project'}
        }

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
        const result = await tryCatch(unarchiveProject({id: projectId}))

        if (result.error) {
          console.error('error unarchiving project:', result.error)
          return {error: 'error unarchiving project'}
        }

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

const DashboardProjects = () => {
  const {data} = useLoaderData<typeof loader>()

  return (
    <>
      <ControlsProjects />

      {data && data.projectsDraft.length > 0 && (
        <ProjectListing title="draft" data={data.projectsDraft} />
      )}

      {data && data.projectsPublished.length > 0 && (
        <ProjectListing title="published" data={data.projectsPublished} />
      )}

      {data && data.projectsArchived.length > 0 && (
        <ProjectListing title="archived" data={data.projectsArchived} />
      )}
    </>
  )
}

export default DashboardProjects
