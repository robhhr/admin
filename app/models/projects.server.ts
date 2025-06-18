import {query} from '../../db'
import slugify from 'slugify'
import {tryCatch} from '~/utils'

interface Status {
  status: 'draft' | 'publish' | 'archive'
}

export interface Project {
  id: string
  status: Status['status']
  title: string
  content: string
  meta: string
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

  try {
    const project = await query<Project>(sql, [
      status,
      title,
      content,
      meta,
      slugify(title, {lower: true, strict: true}),
    ])

    console.log(
      `inserted project titled ${title} and record: ${JSON.stringify(project)}`,
    )
  } catch (error) {
    console.error('error inserting print:', error)
    throw error
  }
}

export async function getProjectById({id}: {id: string}) {
  const sql = `
    SELECT * FROM projects WHERE id = $1;
  `

  try {
    const project = await query<ProjectEdit>(sql, [id])
    return project[0]
  } catch (error) {
    console.error('error retrieving project:', error)
    throw error
  }
}

export async function updateProject({
  id,
  status,
  title,
  content,
  meta,
}: Project) {
  const sql = `
    UPDATE projects
    SET status = $2, title = $3, content = $4, metadata = $5, updated_at = current_timestamp
    WHERE id = $1
  `

  try {
    await query<Project>(sql, [id, status, title, content, meta])

    console.log(`updated project titled ${title} and record: ${id}`)
  } catch (error) {
    console.error('error updating project:', error)
    throw error
  }
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

  try {
    const result = await query<Project>(sql, [id])

    console.log(`archived project record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error archiving project:', error)
    throw error
  }
}

export async function unarchiveProject({id}: {id: string}) {
  const sql = `
    UPDATE projects
    SET status = 'draft', updated_at = current_timestamp
    WHERE id = $1
  `

  try {
    const result = await query<Project>(sql, [id])

    console.log(`unarchived project record: ${JSON.stringify(result)}`)
  } catch (error) {
    console.error('error archiving project:', error)
    throw error
  }
}
