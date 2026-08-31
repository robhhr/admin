import {useEffect, useState} from 'react'
import {type ActionFunctionArgs, redirect, useActionData} from 'react-router'
import {ControlsPhotos} from '~/components/admin'
import {CollectionForm} from '~/components/forms/photos'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {createCollection} from '~/models/photos.server'
import {tryCatch} from '~/utils'

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) return redirect('/login')

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as Record<string, string>

  if (!data.title) {
    console.error('missing required field: title')
    return {error: 'title required'}
  }

  const result = await tryCatch(
    createCollection({
      title: data.title,
      description: data.description,
      location: data.location,
    }),
  )

  if (result.error) {
    console.error('error creating photo collection:', result.error)
    return {error: 'error creating collection'}
  }

  // straight into the collection so uploads can start immediately
  return redirect(`/admin/photo/${result.data.id}`)
}

const DashboardPhotosCreate = () => {
  const [error, setError] = useState<string | null>(null)
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    }
  }, [actionData])

  const handleChange = () => setError(null)

  return (
    <>
      <ControlsPhotos />

      <CollectionForm handleChange={handleChange} />

      <FeedbackDialog actionData={error ? {error} : undefined} />
    </>
  )
}

export default DashboardPhotosCreate
