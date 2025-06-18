import {Link, useFetcher} from 'react-router'
import type {NoteProps} from '~/models/notes.server'

interface Props {
  data: NoteProps
}

export const Note = ({data}: Props) => {
  let archiveFetcher = useFetcher()
  let unarchiveFetcher = useFetcher()

  const isArchiving =
    archiveFetcher.state !== 'idle' &&
    archiveFetcher.formData?.get('intent') === 'archive'

  const isUnarchiving =
    unarchiveFetcher.state !== 'idle' &&
    unarchiveFetcher.formData?.get('intent') === 'unarchive'

  return (
    <div className="flex flex-col justify-between border-b px-1 py-2 last-of-type:border-0">
      <p>{data.title}</p>

      <div className="mt-2.5 flex justify-end">
        <Link
          className="text-edit hover:text-edit/65 dark:text-edit-dark hover:dark:text-edit-dark/65 transition-colors duration-100"
          to={`/admin/note/${data.id}`}
        >
          edit
        </Link>
        <span className="mx-1">•</span>

        {data.status !== 'archive' ? (
          <archiveFetcher.Form method="post">
            <input type="hidden" name="id" value={data.id} />
            <input type="hidden" name="intent" value="archive" />
            <button
              className="text-delete hover:text-delete/65 dark:text-delete-dark hover:dark:text-delete-dark/65 cursor-pointer transition-colors duration-100"
              type="submit"
            >
              {isArchiving ? 'archiving...' : 'archive'}
            </button>
          </archiveFetcher.Form>
        ) : (
          <unarchiveFetcher.Form method="post">
            <input type="hidden" name="id" value={data.id} />
            <input type="hidden" name="intent" value="unarchive" />
            <button
              className="text-publish hover:text-publish/65 dark:text-publish-dark hover:dark:text-publish-dark/65 cursor-pointer transition-colors duration-100"
              type="submit"
            >
              {isUnarchiving ? 'unarchiving...' : 'unarchive'}
            </button>
          </unarchiveFetcher.Form>
        )}
      </div>
    </div>
  )
}
