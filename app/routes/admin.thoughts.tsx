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
      try {
        const result = await archiveThought({id})
        return {
          success: 'thought archived',
          result,
        }
      } catch (error) {
        console.error('error archiving thought:', error)
        return {error: 'error archiving thought'}
      }

    case 'unarchive':
      try {
        const result = await unarchiveThought({id})
        return {
          success: 'thought unarchived',
          result,
        }
      } catch (error) {
        console.error('error unarchiving thought:', error)
        return {error: 'error unarchiving thought'}
      }

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
