import {query} from '../../db'
import {generateUniqueSlug, slugify, tryCatch} from '~/utils'
import type {TagPropsWithStatus} from './tags'

export type PostStatus = 'draft' | 'publish' | 'archive'

export interface NoteProps {
  id: string
  title: string
  content: string
  favorites: number
  is_pinned?: boolean
  status: PostStatus
  tags?: TagPropsWithStatus[]
}

type NoteWriteProps = Omit<NoteProps, 'id' | 'favorites' | 'tags'> & {
  tags?: number[]
}

export async function createNote({
  title,
  content,
  status,
  tags,
}: NoteWriteProps) {
  const sql = `
    INSERT INTO notes (
      title,
      slug,
      content,
      status
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `

  const note = await tryCatch(
    query<NoteProps>(sql, [title, slugify(title), content, status]),
  )

  if (note.error) {
    console.error('error inserting note:', note.error)
    throw note.error
  }

  const noteId = note.data[0].id

  if (tags && tags.length > 0) {
    const valueTuples = tags.map((_, index) => `($1, $${index + 2})`).join(', ')
    const values = [noteId, ...tags.map(Number)]

    const bulkInsertSql = `
    INSERT INTO notes_tags (note_id, tag_id)
    VALUES ${valueTuples}
    ON CONFLICT DO NOTHING;
  `

    await tryCatch(query(bulkInsertSql, values))
  }

  return {success: true}
}

export async function getNoteByIdWithTags({id}: {id: string}) {
  const sql = `
    SELECT
      n.id,
      n.title,
      n.content,
      n.status,
      n.is_pinned,
      n.created_at,
      n.updated_at,
      (
        SELECT
        COALESCE(json_agg(
          jsonb_build_object(
            'id', all_tags.id,
            'name', all_tags.name,
            'is_selected', EXISTS (
              SELECT 1
              FROM notes_tags nt
              WHERE nt.tag_id = all_tags.id AND nt.note_id = n.id
            )
          )
        ), '[]')
        FROM tags AS all_tags
      ) AS tags
    FROM
      notes n
    WHERE
      n.id = $1
    GROUP BY
      n.id;
    `

  const result = await tryCatch(query<NoteProps>(sql, [id]))

  if (result.error) {
    console.error('error fetching note:', result.error)
    throw result.error
  }

  return result.data[0]
}

export async function updateNote({
  id,
  status,
  title,
  content,
  tags,
}: NoteWriteProps & Pick<NoteProps, 'id'>) {
  const sql = `
    UPDATE notes
    SET status = $2, title = $3, content = $4, updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(
    query<NoteProps>(sql, [id, status, title, content]),
  )

  if (result.error) {
    console.error('error updating note:', result.error)
    throw result.error
  }

  const deleteTagsSql = `DELETE FROM notes_tags WHERE note_id = $1;`

  const deleteTags = await tryCatch(query(deleteTagsSql, [id]))

  if (deleteTags.error) {
    console.error('error deleting notes tags:', deleteTags.error)
    throw deleteTags.error
  }

  if (tags && tags?.length > 0) {
    const insertTagsSql = `
        INSERT INTO notes_tags (note_id, tag_id)
        SELECT $1, unnest($2::int[]);
      `
    await tryCatch(query(insertTagsSql, [id, tags]))
  }

  return {success: true}
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
