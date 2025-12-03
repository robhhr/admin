import {query} from '../../db'
import {tryCatch} from '~/utils'

export type PostStatus = 'draft' | 'publish' | 'archive'

export interface ThoughtProps {
  id: string
  content: string
  favorites?: number
  is_pinned?: boolean
  status: PostStatus
}

export interface ThoughtWithTags extends ThoughtProps {
  tags?: number[]
}

export async function createThought({
  content,
  status,
  tags,
}: Omit<ThoughtWithTags, 'id' | 'favorites'>) {
  const sql = `
    INSERT INTO thoughts (
      content,
      status
    )
    VALUES ($1, $2)
    RETURNING id;
  `

  const thought = await tryCatch(query<ThoughtProps>(sql, [content, status]))

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

export async function updateThought({
  id,
  status,
  content,
  is_pinned,
  tags,
}: ThoughtWithTags) {
  await query('BEGIN')

  const sql = `
    UPDATE thoughts
    SET status = $2, content = $3, is_pinned = $4, updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(
    query<ThoughtWithTags>(sql, [id, status, content, is_pinned]),
  )

  if (result.error) {
    console.error('error updating project:', result.error)
    throw result.error
  }

  const deleteTagsSql = `DELETE FROM thought_tags WHERE thought_id = $1;`

  const deleteTags = await tryCatch(query(deleteTagsSql, [id]))

  if (deleteTags.error) {
    console.error('error deleting thought tags:', deleteTags.error)
    throw deleteTags.error
  }

  if (tags && tags?.length > 0) {
    const insertTagsSql = `
        INSERT INTO thought_tags (thought_id, tag_id)
        SELECT $1, unnest($2::int[]);
      `
    await tryCatch(query(insertTagsSql, [id, tags]))
  }

  await query('COMMIT')

  return {success: true}
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
      (
        SELECT
        COALESCE(json_agg(
          jsonb_build_object(
            'id', all_tags.id,
            'name', all_tags.name,
            'is_selected', EXISTS (
              SELECT 1
              FROM thought_tags tt
              WHERE tt.tag_id = all_tags.id AND tt.thought_id = t.id
            )
          )
        ), '[]')
        FROM tags AS all_tags
      ) AS tags
    FROM
      thoughts t
    WHERE
      t.id = $1
    GROUP BY
      t.id;
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
    ORDER BY t.is_pinned DESC, t.created_at DESC;
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

  const result = await tryCatch(query<ThoughtProps>(sql, [id]))

  if (result.error) {
    console.error('error archiving thought:', result.error)
    throw result.error
  }

  return result.data[0]
}

export async function unarchiveThought({id}: {id: string}) {
  const sql = `
    UPDATE thoughts
    SET status = 'draft', updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query<ThoughtProps>(sql, [id]))

  if (result.error) {
    console.error('error archiving thought:', result.error)
    throw result.error
  }

  return result.data[0]
}
