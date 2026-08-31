import {query} from '../../db'
import {type ProcessedPhoto, derivativeKeys} from './photo-pipeline.server'
import {deleteObjects} from './r2.server'
import {slugify, tryCatch} from '~/utils'

export interface PhotoCollection {
  id: string
  slug: string
  title: string
  description: string | null
  location: string | null
  is_published: boolean
  photo_count?: number
}

export interface Photo {
  id: string
  collection_id: string
  storage_prefix: string
  width: number
  height: number
  widths: number[]
  placeholder: string | null
  caption: string | null
  sort_index: number
  is_published: boolean
  taken_at: string | null
  focal_length_mm: string | null
  aperture: string | null
  shutter_speed: string | null
  iso: number | null
  camera_model: string | null
  lens_model: string | null
}

interface CollectionWriteProps {
  title: string
  description?: string
  location?: string
}

export async function createCollection({
  title,
  description,
  location,
}: CollectionWriteProps) {
  const sql = `
    INSERT INTO photo_collections (
      title,
      slug,
      description,
      location
    )
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `

  const collection = await tryCatch(
    query<PhotoCollection>(sql, [
      title,
      slugify(title),
      description || null,
      location || null,
    ]),
  )

  if (collection.error) {
    console.error('error inserting photo collection:', collection.error)
    throw collection.error
  }

  return collection.data[0]
}

export async function getCollections() {
  const sql = `
    SELECT c.id, c.slug, c.title, c.location, c.is_published,
           COUNT(p.id)::int AS photo_count
    FROM photo_collections c
    LEFT JOIN photos p ON p.collection_id = c.id
    GROUP BY c.id
    ORDER BY c.updated_at DESC;
  `

  const collections = await tryCatch(query<PhotoCollection>(sql))

  if (collections.error) {
    console.error('error getting photo collections:', collections.error)
    throw collections.error
  }

  return collections.data
}

export async function getCollectionByIdWithPhotos({id}: {id: string}) {
  const collectionSql = `
    SELECT id, slug, title, description, location, is_published
    FROM photo_collections
    WHERE id = $1;
  `

  const photosSql = `
    SELECT id, collection_id, storage_prefix, width, height, widths,
           placeholder, caption, sort_index, is_published, taken_at,
           focal_length_mm, aperture, shutter_speed, iso, camera_model,
           lens_model
    FROM photos
    WHERE collection_id = $1
    ORDER BY sort_index, created_at;
  `

  const collection = await tryCatch(query<PhotoCollection>(collectionSql, [id]))

  if (collection.error) {
    console.error('error fetching photo collection:', collection.error)
    throw collection.error
  }

  if (!collection.data[0]) return null

  const photos = await tryCatch(query<Photo>(photosSql, [id]))

  if (photos.error) {
    console.error('error fetching photos:', photos.error)
    throw photos.error
  }

  return {...collection.data[0], photos: photos.data}
}

export async function updateCollection({
  id,
  title,
  description,
  location,
  isPublished,
}: CollectionWriteProps & {id: string; isPublished: boolean}) {
  const sql = `
    UPDATE photo_collections
    SET title = $2, description = $3, location = $4, is_published = $5,
        updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(
    query(sql, [id, title, description || null, location || null, isPublished]),
  )

  if (result.error) {
    console.error('error updating photo collection:', result.error)
    throw result.error
  }

  return {success: true}
}

export async function setCollectionPublished({
  id,
  isPublished,
}: {
  id: string
  isPublished: boolean
}) {
  const sql = `
    UPDATE photo_collections
    SET is_published = $2, updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query(sql, [id, isPublished]))

  if (result.error) {
    console.error('error publishing photo collection:', result.error)
    throw result.error
  }

  return {success: true}
}

export async function deleteCollection({id}: {id: string}) {
  const photos = await tryCatch(
    query<Photo>(
      `SELECT storage_prefix, widths FROM photos WHERE collection_id = $1;`,
      [id],
    ),
  )

  if (photos.error) {
    console.error('error fetching photos for deletion:', photos.error)
    throw photos.error
  }

  // remove the R2 objects first; the FK cascade then removes the photo rows
  const keys = photos.data.flatMap(p =>
    derivativeKeys(p.storage_prefix, p.widths),
  )
  const objects = await tryCatch(deleteObjects(keys))

  if (objects.error) {
    console.error('error deleting photo objects:', objects.error)
    throw objects.error
  }

  const result = await tryCatch(
    query(`DELETE FROM photo_collections WHERE id = $1;`, [id]),
  )

  if (result.error) {
    console.error('error deleting photo collection:', result.error)
    throw result.error
  }

  return {success: true}
}

export async function insertPhoto({
  collectionId,
  photo,
}: {
  collectionId: string
  photo: ProcessedPhoto
}) {
  const sql = `
    INSERT INTO photos (
      id,
      collection_id,
      storage_prefix,
      width,
      height,
      widths,
      placeholder,
      sort_index,
      taken_at,
      focal_length_mm,
      aperture,
      shutter_speed,
      iso,
      camera_model,
      lens_model
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      (SELECT COALESCE(MAX(sort_index), -1) + 1 FROM photos WHERE collection_id = $2),
      $8, $9, $10, $11, $12, $13, $14
    )
    RETURNING id;
  `

  const result = await tryCatch(
    query<Photo>(sql, [
      photo.id,
      collectionId,
      photo.storage_prefix,
      photo.width,
      photo.height,
      photo.widths,
      photo.placeholder,
      photo.taken_at,
      photo.focal_length_mm,
      photo.aperture,
      photo.shutter_speed,
      photo.iso,
      photo.camera_model,
      photo.lens_model,
    ]),
  )

  if (result.error) {
    console.error('error inserting photo:', result.error)
    throw result.error
  }

  return result.data[0]
}

export async function deletePhoto({id}: {id: string}) {
  const photo = await tryCatch(
    query<Photo>(`SELECT storage_prefix, widths FROM photos WHERE id = $1;`, [
      id,
    ]),
  )

  if (photo.error) {
    console.error('error fetching photo for deletion:', photo.error)
    throw photo.error
  }

  if (!photo.data[0]) return {success: true}

  const objects = await tryCatch(
    deleteObjects(
      derivativeKeys(photo.data[0].storage_prefix, photo.data[0].widths),
    ),
  )

  if (objects.error) {
    console.error('error deleting photo objects:', objects.error)
    throw objects.error
  }

  const result = await tryCatch(
    query(`DELETE FROM photos WHERE id = $1;`, [id]),
  )

  if (result.error) {
    console.error('error deleting photo:', result.error)
    throw result.error
  }

  return {success: true}
}

export async function updatePhotoCaption({
  id,
  caption,
}: {
  id: string
  caption: string | null
}) {
  const sql = `
    UPDATE photos
    SET caption = $2, updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query(sql, [id, caption]))

  if (result.error) {
    console.error('error updating photo caption:', result.error)
    throw result.error
  }

  return {success: true}
}

export async function togglePhotoPublished({id}: {id: string}) {
  const sql = `
    UPDATE photos
    SET is_published = NOT is_published, updated_at = current_timestamp
    WHERE id = $1
  `

  const result = await tryCatch(query(sql, [id]))

  if (result.error) {
    console.error('error toggling photo:', result.error)
    throw result.error
  }

  return {success: true}
}

export async function movePhoto({
  id,
  direction,
}: {
  id: string
  direction: 'up' | 'down'
}) {
  // swap sort_index with the neighbor in the given direction, if any
  const sql = `
    WITH current AS (
      SELECT id, collection_id, sort_index FROM photos WHERE id = $1
    ),
    neighbor AS (
      SELECT p.id, p.sort_index
      FROM photos p, current c
      WHERE p.collection_id = c.collection_id
        AND ${direction === 'up' ? 'p.sort_index < c.sort_index' : 'p.sort_index > c.sort_index'}
      ORDER BY p.sort_index ${direction === 'up' ? 'DESC' : 'ASC'}
      LIMIT 1
    )
    UPDATE photos p
    SET sort_index = CASE
        WHEN p.id = c.id THEN n.sort_index
        ELSE c.sort_index
      END,
      updated_at = current_timestamp
    FROM current c, neighbor n
    WHERE p.id IN (c.id, n.id);
  `

  const result = await tryCatch(query(sql, [id]))

  if (result.error) {
    console.error('error moving photo:', result.error)
    throw result.error
  }

  return {success: true}
}
