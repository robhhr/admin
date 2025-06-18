import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  Form,
  redirect,
  useActionData,
} from 'react-router'
import {Button} from '~/components/modules'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {InputText} from '~/components/ui/admin/input-text'
import {isUserAuthenticated, updatePassword} from '~/models/auth.server'

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const newPassword = formData.get('new-password') as string
  const confirmNewPassword = formData.get('confirm-new-password') as string

  if (!newPassword || !confirmNewPassword) {
    return {error: 'all fields required'}
  }

  if (newPassword !== confirmNewPassword) {
    return {error: 'passwords do not match'}
  }

  try {
    await updatePassword({password: newPassword})
    return {
      success: 'password updated',
    }
  } catch (error) {
    console.error('error updating password:', error)
    return {error: 'error updating password'}
  }
}

const AdminSettings = () => {
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

  return (
    <div>
      <Form method="post" className="mt-4">
        <div className="flex flex-col">
          <label htmlFor="title" className="mb-1.5">
            new password
          </label>
          <InputText
            name="new-password"
            // onChange={handleChange}
            // defaultValue={data ? data.title : ''}
          />
        </div>

        <div className="mt-4 flex flex-col">
          <label htmlFor="title" className="mb-1.5">
            confirm new password
          </label>
          <InputText
            name="confirm-new-password"
            // onChange={handleChange}
            // defaultValue={data ? data.title : ''}
          />
        </div>

        <Button
          // disabled={navigation.state === 'submitting'}
          // disabled={navigation.state !== 'idle'}
          className="mt-7"
          intent="admin"
          type="submit"
        >
          update
        </Button>
      </Form>

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </div>
  )
}

export default AdminSettings
