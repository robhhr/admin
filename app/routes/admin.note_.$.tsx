import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
} from 'react-router'
import {ControlsNotes} from '~/components/admin'
import {NoteForm} from '~/components/forms/notes'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {getNoteByIdWithTags, updateNote} from '~/models/notes.server'
import {tryCatch, validateUUID} from '~/utils'

export const loader = async ({params}: LoaderFunctionArgs) => {
  const p = params['*']
  const isValid = validateUUID(p)

  if (!p || !isValid) throw new Response('not found', {status: 404})

  const note = await tryCatch(getNoteByIdWithTags({id: p}))

  if (note.error) {
    console.error('error retrieving note:', note.error)
    return {error: note.error}
  }

  return {note: note.data}
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

  const {title, content} = data

  if (!['draft', 'publish', 'archive'].includes(data.status)) {
    return {error: 'invalid status value'}
  }

  const status = data.status as 'draft' | 'publish' | 'archive'
  const tags = formData.getAll('tags').map(id => parseInt(id as string, 10))

  const result = await tryCatch(
    updateNote({id: p, status, title, content, tags}),
  )

  if (result.error) {
    console.error('error updating note:', result.error)
    return {error: 'error updating note'}
  }

  return {
    success: 'note updated',
    result,
    error: null,
  }
}

const DashboardNotesView = () => {
  const {note} = useLoaderData<typeof loader>()
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
        navigate('/admin/notes')
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [actionData, navigate])

  return (
    <>
      <ControlsNotes />

      <NoteForm handleChange={handleChange} data={note} />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardNotesView
