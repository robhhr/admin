import {query} from '../../db'

export interface Project {
  id: string
  status: 'draft' | 'publish'
  title: string
  content: string
  meta: string
}

export async function createProject({
  status,
  title,
  content,
  meta,
}: Project): Promise<void> {
  const sql = `
    INSERT INTO projects (
      status, 
      title,
      content,
      metadata,
      updated_at
    )
    VALUES ($1, $2, $3, $4, current_timestamp)
    RETURNING id;
  `

  try {
    const project = await query<Project>(sql, [status, title, content, meta])

    console.log(
      `inserted project titled ${title} and record: ${JSON.stringify(project)}`,
    )
  } catch (error) {
    console.error('error inserting print:', error)
    throw error
  }
}

export async function getProjectsDraft() {
  const sql = `
    SELECT id, title, status FROM projects WHERE status = 'draft';
  `

  try {
    const projects = await query<Project>(sql)

    return projects
  } catch (error) {
    console.error('error getting projects:', error)
    throw error
  }
}

export async function getProjectsPublished() {
  const sql = `
    SELECT id, title, status FROM projects WHERE status = 'publish';
  `

  try {
    const projects = await query<Project>(sql)

    return projects
  } catch (error) {
    console.error('error getting projects:', error)
    throw error
  }
}
