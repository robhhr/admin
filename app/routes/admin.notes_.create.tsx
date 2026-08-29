import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from 'react-router'
import {ControlsNotes} from '~/components/admin'
import {NoteForm} from '~/components/forms/notes'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {createNote} from '~/models/notes.server'
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

  if (!isAuth) return redirect('/login')

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as Record<string, string>

  const required = ['title', 'content']

  for (const field of required) {
    if (!data[field]) {
      console.error('missing required field:', field)
      return {error: `${field} required`}
    }
  }

  const {title, content} = data

  if (!['draft', 'publish'].includes(data.status)) {
    return {error: 'invalid status value'}
  }

  const status = data.status as 'draft' | 'publish' | 'archive'
  const tags = formData.getAll('tags').map(id => parseInt(id as string, 10))
  const result = await tryCatch(createNote({title, content, status, tags}))

  if (result.error) {
    console.error('error creating note:', result.error)
    return {error: 'error creating note'}
  }

  return {
    success: 'note created',
    result,
    error: null,
  }
}

const DashboardNotesCreate = () => {
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
        navigate('/admin/notes')
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [actionData, navigate])

  const handleChange = () => setError(null)

  return (
    <>
      <ControlsNotes />

      <NoteForm handleChange={handleChange} tags={tags.data} />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardNotesCreate
