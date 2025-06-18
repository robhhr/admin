import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from 'react-router'
import {ControlsThoughts} from '~/components/admin'
import {ThoughtForm} from '~/components/forms/thoughts'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {getTags} from '~/models/tags'
import {createThought} from '~/models/thoughts.server'
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

  if (!isAuth) return redirect('/login')

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
  const tags = formData.getAll('tags') as string[]
  const result = await tryCatch(createThought({content, status, tags}))

  if (result.error) {
    console.error('error creating thought:', result.error)
    return {error: 'error creating thought'}
  }

  return {
    success: 'thought created',
    result,
    error: null,
  }
}

const DashboardThoughtsCreate = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const actionData = useActionData<typeof action>()
  const {data} = useLoaderData<typeof loader>()
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
        navigate('/admin/thoughts')
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [actionData, navigate])

  const handleChange = () => setError(null)

  return (
    <>
      <ControlsThoughts />

      <ThoughtForm handleChange={handleChange} tags={data} />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardThoughtsCreate
