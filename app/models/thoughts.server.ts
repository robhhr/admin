import {query} from '../../db'
import {tryCatch} from '~/utils'

export interface ThoughtProps {
  id: string
  title: string
  content: string
  favorites: number
  is_pinned?: boolean
  status: 'draft' | 'publish' | 'archive'
}

export async function createThought({
  title,
  content,
  status,
}: Omit<ThoughtProps, 'id' | 'favorites'>) {
  const sql = `
    INSERT INTO thoughts (
      title,
      content,
      status
    )
    VALUES ($1, $2, $3)
    RETURNING id;
  `

  const thought = await tryCatch(
    query<ThoughtProps>(sql, [title, content, status]),
  )

  if (thought.error) {
    console.error('error inserting thought:', thought.error)
    throw thought.error
  }

  return thought.data[0]
}
