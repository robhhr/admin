import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
} from 'react-router'
import {ControlsProjects} from '~/components/admin'
import {ProjectForm} from '~/components/forms/projects'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {getProjectById, updateProject} from '~/models/projects.server'
import {tryCatch, validateUUID} from '~/utils'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const p = params['*']
  const isValid = validateUUID(p)

  if (!p || !isValid) throw new Response('not found', {status: 404})

  const project = await tryCatch(getProjectById({id: p}))

  if (project.error) {
    console.error('error retrieving project:', project.error)
    return {error: project.error}
  }

  return {project: project.data}
}

export const action = async ({params, request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) return redirect('/login')

  const p = params['*']
  const isValid = validateUUID(p)

  if (!p || !isValid) return {error: 'not valid project id'}

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as Record<string, string>

  const required = ['status', 'title', 'content']

  for (const field of required) {
    if (!data[field]) {
      console.error('missing required field:', field)
      return {error: `${field} required`}
    }
  }

  const {title, content, meta} = data

  if (!['draft', 'publish', 'archive'].includes(data.status)) {
    return {error: 'invalid status value'}
  }

  const status = data.status as 'draft' | 'publish' | 'archive'

  const result = await tryCatch(
    updateProject({id: p, status, title, content, meta}),
  )

  if (result.error) {
    console.error('error updating project:', result.error)
    return {error: 'error updating project'}
  }

  return {
    success: 'project updated',
    result,
    error: null,
  }
}

const DashboardProjectsView = () => {
  const {project} = useLoaderData<typeof loader>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    } else if (actionData?.success) {
      setSuccess(actionData.success)
    }
  }, [actionData])

  const handleChange = () => setError(null)

  return (
    <>
      <ControlsProjects />

      <ProjectForm
        projectData={project}
        handleChange={handleChange}
        setError={() => setError}
      />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardProjectsView
