import {Link, useFetcher} from 'react-router'
import type {PhotoCollection} from '~/models/photos.server'

interface Props {
  data: PhotoCollection
}

export const PhotoCollectionItem = ({data}: Props) => {
  let publishFetcher = useFetcher()
  let deleteFetcher = useFetcher()

  const publishIntent = data.is_published ? 'unpublish' : 'publish'

  const isPublishing =
    publishFetcher.state !== 'idle' &&
    publishFetcher.formData?.get('intent') === publishIntent

  const isDeleting =
    deleteFetcher.state !== 'idle' &&
    deleteFetcher.formData?.get('intent') === 'delete'

  return (
    <div className="flex flex-col justify-between border-b px-1 py-2 last-of-type:border-0">
      <p>
        {data.title}
        <span className="ml-1.5 text-xs opacity-60">
          {data.photo_count} photo{data.photo_count === 1 ? '' : 's'}
          {data.location ? ` • ${data.location}` : ''}
        </span>
      </p>

      <div className="mt-2.5 flex justify-end">
        <Link
          className="text-edit hover:text-edit/65 dark:text-edit-dark hover:dark:text-edit-dark/65 transition-colors duration-100"
          to={`/admin/photo/${data.id}`}
        >
          edit
        </Link>
        <span className="mx-1">•</span>

        <publishFetcher.Form method="post">
          <input type="hidden" name="id" value={data.id} />
          <input type="hidden" name="intent" value={publishIntent} />
          <button
            className="text-publish hover:text-publish/65 dark:text-publish-dark hover:dark:text-publish-dark/65 cursor-pointer transition-colors duration-100"
            type="submit"
          >
            {isPublishing ? `${publishIntent}ing...` : publishIntent}
          </button>
        </publishFetcher.Form>
        <span className="mx-1">•</span>

        <deleteFetcher.Form
          method="post"
          onSubmit={e => {
            if (!confirm(`delete "${data.title}" and all its photos?`)) {
              e.preventDefault()
            }
          }}
        >
          <input type="hidden" name="id" value={data.id} />
          <input type="hidden" name="intent" value="delete" />
          <button
            className="text-delete hover:text-delete/65 dark:text-delete-dark hover:dark:text-delete-dark/65 cursor-pointer transition-colors duration-100"
            type="submit"
          >
            {isDeleting ? 'deleting...' : 'delete'}
          </button>
        </deleteFetcher.Form>
      </div>
    </div>
  )
}
