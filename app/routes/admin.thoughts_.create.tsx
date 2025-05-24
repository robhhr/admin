import {useEffect, useState} from 'react'
import {type ActionFunctionArgs, redirect, useActionData} from 'react-router'
import {ControlsThoughts} from '~/components/admin'
import {ThoughtForm} from '~/components/forms/thoughts'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {createThought} from '~/models/thoughts.server'
import {tryCatch} from '~/utils'

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
  const result = await tryCatch(createThought({title, content, status}))

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
      <ControlsThoughts />

      <ThoughtForm handleChange={handleChange} />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardThoughtsCreate
