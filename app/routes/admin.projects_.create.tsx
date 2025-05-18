import {useEffect, useState} from 'react'
import {type ActionFunctionArgs, redirect, useActionData} from 'react-router'
import {ControlsProjects} from '~/components/admin'
import {ProjectForm} from '~/components/forms/projects'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {createProject} from '~/models/projects.server'

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

  try {
    const result = await createProject({status, title, content, meta})
    return {
      success: 'project created',
      result,
    }
  } catch (error) {
    console.error('error inserting project:', error)
    return {error: 'error creating project'}
  }
}

const DashboardProjectsCreate = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const actionData = useActionData<typeof action>()
  // console.log(actionData, ' actionData')
  // console.log(actionData && JSON.parse(actionData.meta))

  // console.log(navigation)
  // console.log(actionData, ' actionData')

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

      <ProjectForm handleChange={handleChange} setError={() => setError} />

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardProjectsCreate
