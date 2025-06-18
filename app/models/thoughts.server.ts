import {query} from '../../db'
import {tryCatch} from '~/utils'

export type PostStatus = 'draft' | 'publish' | 'archive'

export interface ThoughtProps {
  id: string
  content: string
  favorites: number
  is_pinned?: boolean
  status: PostStatus
  tags?: string[]
}

export interface Tag {
  id: number
  name: string
}

export interface ThoughtWithTags extends ThoughtProps {
  tags: string[]
}

export async function createThought({
  content,
  status,
  tags,
}: Omit<ThoughtProps, 'id' | 'favorites'>) {
  const sql = `
    INSERT INTO thoughts (
      content,
      status
    )
    VALUES ($1, $2)
    RETURNING id;
  `

  const thought = await tryCatch(
    query<ThoughtProps>(sql, [content, status]),
  )

  if (thought.error) {
    console.error('error inserting thought:', thought.error)
    throw thought.error
  }

  const thoughtId = thought.data[0].id

  if (tags && tags.length > 0) {
    const valueTuples = tags.map((_, index) => `($1, $${index + 2})`).join(', ')
    const values = [thoughtId, ...tags.map(Number)]

    const bulkInsertSql = `
    INSERT INTO thought_tags (thought_id, tag_id)
    VALUES ${valueTuples}
    ON CONFLICT DO NOTHING;
  `

    await tryCatch(query(bulkInsertSql, values))
  }

  return thought.data[0]
}

export async function getThoughtByIdWithTags({id}: {id: string}) {
  const sql = `
    SELECT 
      t.id,
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
    WHERE t.id = $1
    GROUP BY t.id;
  `

  const result = await tryCatch(query<ThoughtWithTags>(sql, [id]))

  if (result.error) {
    console.error('error fetching thought:', result.error)
    throw result.error
  }

  return result.data[0]
}

export async function getThoughtsByStatusWithTags(status: PostStatus[]) {
  const sql = `
      SELECT 
      t.id,
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
