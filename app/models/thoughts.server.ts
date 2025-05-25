import {query} from '../../db'
import {tryCatch} from '~/utils'

export type ThoughtStatus = 'draft' | 'publish' | 'archive'

export interface ThoughtProps {
  id: string
  title: string
  content: string
  favorites: number
  is_pinned?: boolean
  status: ThoughtStatus
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

export async function getThoughtsByStatusWithTags(status: ThoughtStatus[]) {
  const sql = `
      SELECT 
      t.id,
      t.title,
      t.content,
      t.status,
      t.is_pinned,
      t.favorites,
      t.created_at,
      t.updated_at,
      COALESCE(json_agg(
        DISTINCT jsonb_build_object('id', tg.id, 'name', tg.name)
      ) FILTER (WHERE tg.id IS NOT NULL), '[]') AS tags
    FROM thoughts t
    LEFT JOIN thought_tags tt ON t.id = tt.thought_id
    LEFT JOIN tags tg ON tt.tag_id = tg.id
    WHERE t.status = ANY($1)
    GROUP BY t.id
    ORDER BY t.is_pinned DESC, t.updated_at DESC;
  `

  const thoughts = await tryCatch(query<ThoughtProps>(sql, [status]))

  if (thoughts.error) {
    console.error('error getting thoughts:', thoughts.error)
    throw thoughts.error
  }

  return thoughts.data
}

export async function archiveThought({id}: {id: string}) {
  const sql = `
    UPDATE thoughts
    SET is_pinned = false, status = 'archive', updated_at = current_timestamp
    WHERE id = $1
  `

  try {
    const result = await query<ThoughtProps>(sql, [id])

    console.log(`archived thought record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error archiving thought:', error)
    throw error
  }
}

export async function unarchiveThought({id}: {id: string}) {
  const sql = `
    UPDATE thoughts
    SET status = 'draft', updated_at = current_timestamp
    WHERE id = $1
  `

  try {
    const result = await query<ThoughtProps>(sql, [id])

    console.log(`unarchived thought record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error archiving thought:', error)
    throw error
  }
}
