import {useState} from 'react'
import {type LoaderFunctionArgs, useLoaderData} from 'react-router'
import {ControlsThoughts} from '~/components/admin'
import {ThoughtForm} from '~/components/forms/thoughts'
import {getThoughtByIdWithTags} from '~/models/thoughts.server'
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

const DashboardThoughtsEditView = () => {
  const {thought} = useLoaderData<typeof loader>()
  const [error, setError] = useState<string | null>(null)

  const handleChange = () => setError(null)

  return (
    <>
      <ControlsThoughts />

      <ThoughtForm handleChange={handleChange} data={thought} />
    </>
  )
}

export default DashboardThoughtsEditView
