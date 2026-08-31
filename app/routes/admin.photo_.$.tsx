import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
} from 'react-router'
import {type FileUpload, parseFormData} from '@remix-run/form-data-parser'
import {randomUUID} from 'node:crypto'
import {createWriteStream} from 'node:fs'
import {unlink} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {Readable} from 'node:stream'
import {pipeline} from 'node:stream/promises'
import {ControlsPhotos, PhotoGrid} from '~/components/admin'
import {CollectionForm, PhotoUploadForm} from '~/components/forms/photos'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {isUserAuthenticated} from '~/models/auth.server'
import {processPhoto} from '~/models/photo-pipeline.server'
import {
  deletePhoto,
  getCollectionByIdWithPhotos,
  insertPhoto,
  movePhoto,
  togglePhotoPublished,
  updateCollection,
  updatePhotoCaption,
} from '~/models/photos.server'
import {tryCatch, validateUUID} from '~/utils'

const MAX_FILE_SIZE = 80 * 1024 * 1024 // raw files run 30-60MB
const MAX_FILES = 12

// stream each upload to a tmp file so a batch of raws never sits in memory;
// the tmp path replaces the file in the parsed FormData
const uploadHandler = async (fileUpload: FileUpload) => {
  if (fileUpload.fieldName !== 'files' || !fileUpload.name) return null

  const tmpPath = path.join(
    tmpdir(),
    `photo-upload-${randomUUID()}${path.extname(fileUpload.name)}`,
  )

  await pipeline(
    Readable.fromWeb(fileUpload.stream() as never),
    createWriteStream(tmpPath),
  )

  return `${tmpPath}|${fileUpload.name}`
}

export const loader = async ({params}: LoaderFunctionArgs) => {
  const p = params['*']
  const isValid = validateUUID(p)

  if (!p || !isValid) throw new Response('not found', {status: 404})

  const collection = await tryCatch(getCollectionByIdWithPhotos({id: p}))

  if (collection.error) {
    console.error('error retrieving photo collection:', collection.error)
    return {error: collection.error, collection: null}
  }

  if (!collection.data) throw new Response('not found', {status: 404})

  return {
    collection: collection.data,
    // client components can't read server env, so the loader hands it down
    baseUrl: process.env.R2_PUBLIC_BASE_URL ?? '',
    error: null,
  }
}

export const action = async ({params, request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) return redirect('/login')

  const p = params['*']
  const isValid = validateUUID(p)

  if (!p || !isValid) return {error: 'not valid collection id'}

  const parsed = await tryCatch(
    parseFormData(
      request,
      {maxFileSize: MAX_FILE_SIZE, maxFiles: MAX_FILES},
      uploadHandler,
    ),
  )

  if (parsed.error) {
    console.error('error parsing form data:', parsed.error)
    return {error: 'upload too large or invalid'}
  }

  const formData = parsed.data
  const intent = (formData.get('intent') ?? formData.get('action')) as string

  switch (intent) {
    case 'update': {
      const data = Object.fromEntries(formData) as Record<string, string>

      if (!data.title) return {error: 'title required'}

      if (!['draft', 'publish'].includes(data.status)) {
        return {error: 'invalid status value'}
      }

      const result = await tryCatch(
        updateCollection({
          id: p,
          title: data.title,
          description: data.description,
          location: data.location,
          isPublished: data.status === 'publish',
        }),
      )

      if (result.error) {
        console.error('error updating photo collection:', result.error)
        return {error: 'error updating collection'}
      }

      return {success: 'collection updated', error: null}
    }

    case 'upload': {
      const files = formData
        .getAll('files')
        .filter((f): f is string => typeof f === 'string' && f.length > 0)

      if (files.length === 0) return {error: 'no files uploaded'}

      const failed: string[] = []

      // one at a time keeps peak memory to a single decoded image
      for (const file of files) {
        const [tmpPath, ...nameParts] = file.split('|')
        const originalName = nameParts.join('|')

        const processed = await tryCatch(processPhoto(tmpPath))

        if (processed.error) {
          console.error(`error processing ${originalName}:`, processed.error)
          failed.push(originalName)
        } else {
          const inserted = await tryCatch(
            insertPhoto({collectionId: p, photo: processed.data}),
          )

          if (inserted.error) {
            console.error(`error inserting ${originalName}:`, inserted.error)
            failed.push(originalName)
          }
        }

        await tryCatch(unlink(tmpPath))
      }

      if (failed.length > 0) {
        return {
          error: `${failed.length}/${files.length} failed: ${failed.join(', ')}`,
        }
      }

      return {
        success: `${files.length} photo${files.length > 1 ? 's' : ''} uploaded`,
        error: null,
      }
    }

    case 'photo-caption':
    case 'photo-delete':
    case 'photo-toggle':
    case 'photo-move-up':
    case 'photo-move-down': {
      const id = formData.get('id') as string

      if (!id || !validateUUID(id)) return {error: 'photo id required'}

      const caption = ((formData.get('caption') as string) ?? '').trim()

      const operations = {
        'photo-caption': () =>
          updatePhotoCaption({id, caption: caption || null}),
        'photo-delete': () => deletePhoto({id}),
        'photo-toggle': () => togglePhotoPublished({id}),
        'photo-move-up': () => movePhoto({id, direction: 'up'}),
        'photo-move-down': () => movePhoto({id, direction: 'down'}),
      }

      const result = await tryCatch(operations[intent]())

      if (result.error) {
        console.error(`error with ${intent}:`, result.error)
        return {error: `error with ${intent}`}
      }

      return {success: 'photo updated', error: null}
    }

    default:
      return {error: 'invalid intent'}
  }
}

const DashboardPhotosView = () => {
  const {collection, baseUrl} = useLoaderData<typeof loader>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    } else if (actionData?.success) {
      setSuccess(actionData.success)
    }
  }, [actionData])

  const handleChange = () => setError(null)

  if (!collection) return <ControlsPhotos />

  return (
    <>
      <ControlsPhotos />

      <CollectionForm handleChange={handleChange} data={collection} />

      <PhotoUploadForm />

      {collection.photos.length > 0 && (
        <PhotoGrid data={collection.photos} baseUrl={baseUrl ?? ''} />
      )}

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardPhotosView
