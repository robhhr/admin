import {type ActionFunctionArgs, redirect, useLoaderData} from 'react-router'
import {ControlsThoughts, ThoughtListing} from '~/components/admin'
import {isUserAuthenticated} from '~/models/auth.server'
import {
  type ThoughtProps,
  archiveThought,
  getThoughtsByStatusWithTags,
  unarchiveThought,
} from '~/models/thoughts.server'
import {tryCatch} from '~/utils'

export const loader = async () => {
  const data = await tryCatch(
    getThoughtsByStatusWithTags(['publish', 'draft', 'archive']),
  )

  if (data.error) {
    console.error('error retrieving thoughts:', data.error)
    return {error: data.error}
  }

  const grouped = {
    thoughtsPublished: [] as ThoughtProps[],
    thoughtsDraft: [] as ThoughtProps[],
    thoughtsArchived: [] as ThoughtProps[],
  }

  for (const thought of data.data) {
    switch (thought.status) {
      case 'publish':
        grouped.thoughtsPublished.push(thought)
        break
      case 'draft':
        grouped.thoughtsDraft.push(thought)
        break
      case 'archive':
        grouped.thoughtsArchived.push(thought)
        break
    }
  }

  return {data: grouped, error: null}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  const id = formData.get('id') as string

  if (!id) return {error: 'id required'}

  switch (intent) {
    case 'archive':
      const result = await tryCatch(archiveThought({id}))

      if (result.error) {
        console.error('error archiving thought:', result.error)
        return {error: 'error archiving thought'}
      }

      return {
        success: 'thought archived',
        result,
      }

    case 'unarchive':
      const resultUnArchive = await tryCatch(unarchiveThought({id}))

      if (resultUnArchive.error) {
        console.error('error unarchiving thought:', resultUnArchive.error)
      }

      return {success: 'thought unarchived', resultUnArchive}

    default:
      return {error: 'invalid intent'}
  }
}

const AdminThoughts = () => {
  const {data} = useLoaderData<typeof loader>()

  return (
    <>
      <ControlsThoughts />

      {data?.thoughtsDraft && data.thoughtsDraft.length > 0 && (
        <ThoughtListing title="draft" data={data.thoughtsDraft} />
      )}

      {data?.thoughtsPublished && data.thoughtsPublished.length > 0 && (
        <ThoughtListing title="published" data={data.thoughtsPublished} />
      )}

      {data?.thoughtsArchived && data.thoughtsArchived.length > 0 && (
        <ThoughtListing title="archived" data={data.thoughtsArchived} />
      )}
    </>
  )
}

export default AdminThoughts
