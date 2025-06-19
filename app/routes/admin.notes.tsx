import {type ActionFunctionArgs, redirect, useLoaderData} from 'react-router'
import {ControlsNotes, NoteListing} from '~/components/admin'
import {isUserAuthenticated} from '~/models/auth.server'
import {
  type NoteProps,
  archiveNote,
  getNotes,
  unarchiveNote,
} from '~/models/notes.server'
import {tryCatch} from '~/utils'

export const loader = async () => {
  const data = await tryCatch(getNotes())

  if (data.error) {
    console.error('error retrieving notes:', data.error)
    return {error: data.error}
  }

  const grouped = {
    notesPublished: [] as NoteProps[],
    notesDraft: [] as NoteProps[],
    notesArchived: [] as NoteProps[],
  }

  for (const note of data.data) {
    switch (note.status) {
      case 'publish':
        grouped.notesPublished.push(note)
        break
      case 'draft':
        grouped.notesDraft.push(note)
        break
      case 'archive':
        grouped.notesArchived.push(note)
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

  const performAction = async (
    action: (args: {id: string}) => Promise<unknown>,
    label: string,
  ) => {
    const result = await tryCatch(action({id}))

    if (result.error) {
      console.error(`error with ${label} note:`, result.error)
      return {error: `error with ${label} note`}
    }

    return {
      success: `note ${label}`,
      result,
    }
  }

  switch (intent) {
    case 'archive':
      return await performAction(archiveNote, 'archiving')

    case 'unarchive':
      return await performAction(unarchiveNote, 'unarchiving')

    default:
      return {error: 'invalid intent'}
  }
}

const AdminNotes = () => {
  const {data} = useLoaderData<typeof loader>()

  return (
    <>
      <ControlsNotes />

      {data && data.notesDraft.length > 0 && (
        <NoteListing title="draft" data={data.notesDraft} />
      )}

      {data && data.notesPublished.length > 0 && (
        <NoteListing title="published" data={data.notesPublished} />
      )}

      {data && data.notesArchived.length > 0 && (
        <NoteListing title="archived" data={data.notesArchived} />
      )}
    </>
  )
}

export default AdminNotes
