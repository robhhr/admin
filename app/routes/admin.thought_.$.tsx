import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from 'react-router'
import {ControlsThoughts} from '~/components/admin'
import {ThoughtForm} from '~/components/forms/thoughts'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {getThoughtByIdWithTags, updateThought} from '~/models/thoughts.server'
import {tryCatch, validateUUID} from '~/utils'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const p = params['*']
  const isValid = validateUUID(p)

  if (!p || !isValid) throw new Response('not found', {status: 404})

  const thought = await tryCatch(getThoughtByIdWithTags({id: p}))

  if (thought.error) {
    console.error('error retrieving thought:', thought.error)
    return {error: thought.error}
  }

  return {thought: thought.data}
}

export const action = async ({params, request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) return redirect('/login')

  const id = params['*']

  if (!id || !validateUUID(id)) {
    console.error('invalid thought id:', id)
    return {error: 'invalid thought id'}
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as Record<string, string>

  const required = ['content']

  for (const field of required) {
    if (!data[field]) {
      console.error('missing required field:', field)
      return {error: `${field} required`}
    }
  }

  const {content} = data

  if (!['draft', 'publish'].includes(data.status)) {
    return {error: 'invalid status value'}
  }

  const status = data.status as 'draft' | 'publish' | 'archive'
  const tags = formData.getAll('tags').map(id => parseInt(id as string, 10))
  const result = await tryCatch(updateThought({id, content, status, tags}))

  if (result.error) {
    console.error('error updating thought:', result.error)
    return {error: 'error updating thought'}
  }

  return {
    success: 'thought updated',
    result,
    error: null,
  }
}

const DashboardThoughtsEditView = () => {
  const {thought} = useLoaderData<typeof loader>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const actionData = useActionData<typeof action>()
  const navigate = useNavigate()

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    } else if (actionData?.success) {
      setSuccess(actionData.success)
    }
  }, [actionData])

  const handleChange = () => setError(null)

  useEffect(() => {
    if (actionData?.success) {
      const timeout = setTimeout(() => {
        navigate('/admin/thoughts')
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [actionData, navigate])

  return (
    <>
      <ControlsThoughts />

      <ThoughtForm handleChange={handleChange} data={thought} />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardThoughtsEditView
