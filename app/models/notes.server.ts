import {query} from '../../db'
import {tryCatch} from '~/utils'

export type PostStatus = 'draft' | 'publish' | 'archive'

export interface NoteProps {
  id: string
  title: string
  content: string
  favorites: number
  is_pinned?: boolean
  status: PostStatus
  tags?: string[]
}

export async function createNote({
  title,
  content,
  status,
}: Omit<NoteProps, 'id' | 'favorites'>) {
  const sql = `
    INSERT INTO notes (
      title,
      content,
      status
    )
    VALUES ($1, $2, $3)
    RETURNING id;
  `

  const note = await tryCatch(
    query<NoteProps>(sql, [title, content, status]),
  )

  if (note.error) {
    console.error('error inserting note:', note.error)
    throw note.error
  }

  return note.data[0]
}

export async function getNotesByStatus({
  status,
}: {
  status: NoteProps['status']
}) {
  const sql = `
    SELECT id, title, status FROM notes WHERE status = $1 ORDER BY updated_at DESC;
  `

  try {
    const notes = await query<NoteProps>(sql, [status])

    return notes
  } catch (error) {
    console.error('error getting notes:', error)
    throw error
  }
}

export async function archiveNote({id}: {id: string}) {
  const sql = `
    UPDATE notes
    SET is_pinned = false, status = 'archive', updated_at = current_timestamp
    WHERE id = $1
  `

  try {
    const result = await query<NoteProps>(sql, [id])

    console.log(`archived note record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error archiving note:', error)
    throw error
  }
}

export async function unarchiveNote({id}: {id: string}) {
  const sql = `
    UPDATE notes
    SET status = 'draft', updated_at = current_timestamp
    WHERE id = $1
  `

  try {
    const result = await query<NoteProps>(sql, [id])

    console.log(`unarchived note record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error archiving note:', error)
    throw error
  }
}
