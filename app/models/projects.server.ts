import {query} from '../../db'
import {generateUniqueSlug, slugify, tryCatch} from '~/utils'

interface Status {
  status: 'draft' | 'publish' | 'archive'
}

export interface Project {
  id: string
  status: Status['status']
  title: string
  content: string
  meta: string
  tags?: number[]
}

export interface MetaProps {
  label: string
  value: string
  showAdditional: boolean
  additionalValues?: string[]
}

export interface ProjectEdit {
  id: string
  status: Status['status']
  title: string
  content: string
  metadata?: MetaProps[]
}

export async function createProject({
  status,
  title,
  content,
  meta,
  tags,
}: Omit<Project, 'id'>) {
  const sql = `
    INSERT INTO projects (
      status, 
      title,
      content,
      metadata,
      slug,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, current_timestamp)
    RETURNING id;
  `

  const project = await tryCatch(
    query<Project>(sql, [status, title, content, meta, slugify(title)]),
  )

  if (project.error) {
    console.error('error inserting print:', project.error)
    throw project.error
  }

  const projectId = project.data[0].id

  if (tags && tags.length > 0) {
    const valueTuples = tags.map((_, index) => `($1, $${index + 2})`).join(', ')
    const values = [projectId, ...tags.map(Number)]

    const bulkInsertSql = `
    INSERT INTO projects_tags (project_id, tag_id)
    VALUES ${valueTuples}
    ON CONFLICT DO NOTHING;
  `

    await tryCatch(query(bulkInsertSql, values))
  }

  return {success: true}
}

export async function getProjectByIdWithTags({id}: {id: string}) {
  const sql = `
    SELECT
      p.id,
      p.title,
      p.content,
      p.status,
      p.metadata,
      p.created_at,
      p.updated_at,
      (
        SELECT
        COALESCE(json_agg(
          jsonb_build_object(
            'id', all_tags.id,
            'name', all_tags.name,
            'is_selected', EXISTS (
              SELECT 1
              FROM projects_tags pt
              WHERE pt.tag_id = all_tags.id AND pt.project_id = p.id
            )
          )
        ), '[]')
        FROM tags AS all_tags
      ) AS tags
    FROM
      projects p
    WHERE
      p.id = $1
    GROUP BY
      p.id;
    `

  const project = await tryCatch(query<ProjectEdit>(sql, [id]))

  if (project.error) {
    console.error('error retrieving project:', project.error)
    throw project.error
  }

  return project.data[0]
}

export async function updateProject({
  id,
  status,
  title,
  content,
  meta,
  tags,
}: Project) {
  const sql = `
    UPDATE projects
    SET status = $2, title = $3, content = $4, metadata = $5, updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(
    query<Project>(sql, [id, status, title, content, meta]),
  )

  if (result.error) {
    console.error('error updating project:', result.error)
    throw result.error
  }

  const deleteTagsSql = `DELETE FROM projects_tags WHERE project_id = $1;`

  const deleteTags = await tryCatch(query(deleteTagsSql, [id]))

  if (deleteTags.error) {
    console.error('error deleting project tags:', deleteTags.error)
    throw deleteTags.error
  }

  if (tags && tags?.length > 0) {
    const insertTagsSql = `
        INSERT INTO projects_tags (project_id, tag_id)
        SELECT $1, unnest($2::int[]);
      `
    await tryCatch(query(insertTagsSql, [id, tags]))
  }

  return {success: true}
}

export async function getProjects() {
  const sql = `
    SELECT id, title, status FROM projects ORDER BY updated_at DESC;
  `

  const projects = await tryCatch(query<Project>(sql))

  if (projects.error) {
    console.error('error getting projects:', projects.error)
    throw projects.error
  }

  return projects.data
}

export async function archiveProject({id}: {id: string}) {
  const sql = `
    UPDATE projects
    SET status = 'archive', updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query<Project>(sql, [id]))

  if (result.error) {
    console.error('error archiving project:', result.error)
    throw result.error
  }

  return result.data[0]
}

export async function unarchiveProject({id}: {id: string}) {
  const sql = `
    UPDATE projects
    SET status = 'draft', updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query<Project>(sql, [id]))

  if (result.error) {
    console.error('error archiving project:', result.error)
    throw result.error
  }

  return result.data[0]
}
