import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from 'react-router'
import {ControlsProjects} from '~/components/admin'
import {ProjectForm} from '~/components/forms/projects'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {createProject} from '~/models/projects.server'
import {getTags} from '~/models/tags'
import {tryCatch} from '~/utils'

export const loader = async () => {
  const tags = await tryCatch(getTags())

  if (tags.error) {
    console.error('error retrieving tags:', tags.error)
    return {error: tags.error}
  }

  return {error: null, data: tags.data}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const body = await request.formData()
  const status = body.get('status') as 'draft' | 'publish'
  const title = body.get('title') as string
  const content = body.get('content') as string
  const meta = body.get('meta') as string

  // NOTE: meta excluded since its optional & status has default value
  if (!title) return {error: 'title required'}
  if (!content) return {error: 'content required'}

  const tags = body.getAll('tags').map(id => parseInt(id as string, 10))
  const data = await tryCatch(
    createProject({status, title, content, meta, tags}),
  )

  if (data.error) {
    console.error('error creating project:', data.error)
    return {error: 'error creating project'}
  }

  return {
    success: 'project created',
    data,
  }
}

const DashboardProjectsCreate = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const tags = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    } else if (actionData?.success) {
      setSuccess(actionData.success)
    }
  }, [actionData])

  useEffect(() => {
    if (actionData?.success) {
      const timeout = setTimeout(() => {
        navigate('/admin/projects')
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [actionData, navigate])

  const handleChange = () => setError(null)

  return (
    <>
      <ControlsProjects />

      <ProjectForm
        handleChange={handleChange}
        setError={() => setError}
        tags={tags}
      />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardProjectsCreate
