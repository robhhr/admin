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

  const note = await tryCatch(query<NoteProps>(sql, [title, content, status]))

  if (note.error) {
    console.error('error inserting note:', note.error)
    throw note.error
  }

  return note.data[0]
}

export async function getNotes() {
  const sql = `
    SELECT id, title, status FROM notes ORDER BY updated_at DESC;
  `

  const notes = await tryCatch(query<NoteProps>(sql))

  if (notes.error) {
    console.error('error getting notes:', notes.error)
    throw notes.error
  }

  return notes.data
}

export async function archiveNote({id}: {id: string}) {
  const sql = `
    UPDATE notes
    SET is_pinned = false, status = 'archive', updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query<NoteProps>(sql, [id]))

  if (result.error) {
    console.error('error archiving note:', result.error)
    throw result.error
  }

  return result.data[0]
}

export async function unarchiveNote({id}: {id: string}) {
  const sql = `
    UPDATE notes
    SET status = 'draft', updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query<NoteProps>(sql, [id]))

  if (result.error) {
    console.error('error archiving note:', result.error)
    throw result.error
  }

  return result.data[0]
}
