import {type ActionFunctionArgs, redirect, useLoaderData} from 'react-router'
import {ControlsPhotos, PhotoCollectionListing} from '~/components/admin'
import {isUserAuthenticated} from '~/models/auth.server'
import {
  type PhotoCollection,
  deleteCollection,
  getCollections,
  setCollectionPublished,
} from '~/models/photos.server'
import {tryCatch} from '~/utils'

export const loader = async () => {
  const data = await tryCatch(getCollections())

  if (data.error) {
    console.error('error retrieving photo collections:', data.error)
    return {error: data.error}
  }

  const grouped = {
    collectionsPublished: [] as PhotoCollection[],
    collectionsDraft: [] as PhotoCollection[],
  }

  for (const collection of data.data) {
    if (collection.is_published) {
      grouped.collectionsPublished.push(collection)
    } else {
      grouped.collectionsDraft.push(collection)
    }
  }

  return {data: grouped, error: null}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const intent = formData.get('intent')
  const id = formData.get('id') as string

  if (!id) return {error: 'id required'}

  const performAction = async (
    action: () => Promise<unknown>,
    label: string,
  ) => {
    const result = await tryCatch(action())

    if (result.error) {
      console.error(`error with ${label} collection:`, result.error)
      return {error: `error with ${label} collection`}
    }

    return {
      success: `collection ${label}`,
      result,
    }
  }

  switch (intent) {
    case 'publish':
      return await performAction(
        () => setCollectionPublished({id, isPublished: true}),
        'publishing',
      )

    case 'unpublish':
      return await performAction(
        () => setCollectionPublished({id, isPublished: false}),
        'unpublishing',
      )

    case 'delete':
      return await performAction(() => deleteCollection({id}), 'deleting')

    default:
      return {error: 'invalid intent'}
  }
}

const AdminPhotos = () => {
  const {data} = useLoaderData<typeof loader>()

  return (
    <>
      <ControlsPhotos />

      {data && data.collectionsDraft.length > 0 && (
        <PhotoCollectionListing title="draft" data={data.collectionsDraft} />
      )}

      {data && data.collectionsPublished.length > 0 && (
        <PhotoCollectionListing
          title="published"
          data={data.collectionsPublished}
        />
      )}
    </>
  )
}

export default AdminPhotos
