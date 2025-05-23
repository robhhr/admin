import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  useActionData,
  useLoaderData,
} from 'react-router'
import {ControlsProjects} from '~/components/admin'
import {ProjectForm} from '~/components/forms/projects'
import {getProjectById} from '~/models/projects.server'
import {tryCatch, validateUUID} from '~/utils'

export const loader = async ({params, request}: LoaderFunctionArgs) => {
  const p = params['*']
  const isValid = validateUUID(p)

  if (!p || !isValid) {
    throw new Response('not found', {status: 404})
  }

  const project = await tryCatch(getProjectById({id: p}))

  if (project.error) {
    console.error('error retrieving project:', project.error)
    return {error: project.error}
  }

  return {project: project.data}
}

export const action = async ({request}: ActionFunctionArgs) => {
  return {error: null, success: null}
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
    </>
  )
}

export default DashboardProjectsView
