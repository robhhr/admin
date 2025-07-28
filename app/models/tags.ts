import {query} from '../../db'
import {tryCatch} from '~/utils'

export interface TagProps {
  id: string
  name: string
}

export interface TagPropsWithStatus extends TagProps {
  is_selected: boolean  
}

export async function createTag({name}: {name: string}) {
  const sql = `
    INSERT INTO tags (name)
    VALUES ($1)
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `

  const tag = await tryCatch(query<TagProps>(sql, [name]))

  if (tag.error) {
    console.error('error inserting tag:', tag.error)
    throw tag.error
  }

  return tag.data[0]
}

export async function getTags() {
  const sql = `
    SELECT * FROM tags;
  `

  const tags = await tryCatch(query<TagProps>(sql))

  if (tags.error) {
    console.error('error getting tags:', tags.error)
    throw tags.error
  }

  return tags.data
}

export async function deleteTagById({id}: {id: string}) {
  const sql = `
    DELETE FROM tags
    WHERE id = $1
  `

  const tag = await tryCatch(query<TagProps>(sql, [id]))

  if (tag.error) {
    console.error('error deleting tag:', tag.error)
    throw tag.error
  }

  return tag.data
}
