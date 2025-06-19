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

  switch (intent) {
    case 'archive':
      const archive = await tryCatch(archiveNote({id}))

      if (archive.error) {
        console.error('error archiving note:', archive.error)
        return {error: 'error archiving note'}
      }

      return {
        success: 'note archived',
        result: archive,
      }

    case 'unarchive':
      const unarchive = await tryCatch(unarchiveNote({id}))

      if (unarchive.error) {
        console.error('error unarchiving note:', unarchive.error)
        return {error: 'error unarchiving note'}
      }

      return {
        success: 'note unarchived',
        result: unarchive,
      }

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
