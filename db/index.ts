// @ts-ignore
import pg from 'pg'

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:svp3rs3cr3t@localhost:5432/robhhr',
  ssl:
    process.env.NODE_ENV === 'production'
      ? {rejectUnauthorized: false}
      : undefined,
})

export const query = async <T>(text: string, params?: any[]): Promise<T[]> => {
  const result = await pool.query<T>(text, params)
  return result.rows
}
