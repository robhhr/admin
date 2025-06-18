import {type ActionFunctionArgs, redirect, useLoaderData} from 'react-router'
import {ControlsNotes, NoteListing} from '~/components/admin'
import {isUserAuthenticated} from '~/models/auth.server'
import {
  archiveNote,
  getNotesByStatus,
  unarchiveNote,
} from '~/models/notes.server'

export const loader = async () => {
  const [notesPublished, notesDraft, notesArchived] = await Promise.all([
    getNotesByStatus({status: 'publish'}),
    getNotesByStatus({status: 'draft'}),
    getNotesByStatus({status: 'archive'}),
  ])

  if (!notesPublished || !notesDraft || !notesArchived) {
    console.error('error retrieving notes:', notesPublished)
    return {error: notesPublished}
  }

  return {notesArchived, notesDraft, notesPublished}
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
        const result = await archiveNote({id})
        return {
          success: 'note archived',
          result,
        }
      } catch (error) {
        console.error('error archiving note:', error)
        return {error: 'error archiving note'}
      }

    case 'unarchive':
      try {
        const result = await unarchiveNote({id})
        return {
          success: 'note unarchived',
          result,
        }
      } catch (error) {
        console.error('error unarchiving note:', error)
        return {error: 'error unarchiving note'}
      }

    default:
      return {error: 'invalid intent'}
  }
}

const AdminNotes = () => {
  const {notesArchived, notesDraft, notesPublished} =
    useLoaderData<typeof loader>()

  return (
    <>
      <ControlsNotes />

      {notesDraft && notesDraft.length > 0 && (
        <NoteListing title="draft" data={notesDraft} />
      )}

      {notesPublished && notesPublished.length > 0 && (
        <NoteListing title="published" data={notesPublished} />
      )}

      {notesArchived && notesArchived.length > 0 && (
        <NoteListing title="archived" data={notesArchived} />
      )}
    </>
  )
}

export default AdminNotes
