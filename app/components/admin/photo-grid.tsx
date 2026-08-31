import {useFetcher} from 'react-router'
import {InputText} from '~/components/ui/admin/input-text'
import type {Photo} from '~/models/photos.server'

interface Props {
  data: Photo[]
  baseUrl: string
}

const PhotoCard = ({photo, baseUrl}: {photo: Photo; baseUrl: string}) => {
  const fetcher = useFetcher()
  const captionFetcher = useFetcher()
  const isBusy = fetcher.state !== 'idle'
  const isSavingCaption = captionFetcher.state !== 'idle'

  const thumbWidth = photo.widths[0]

  const submit = (intent: string) => {
    fetcher.submit({id: photo.id, intent}, {method: 'post'})
  }

  return (
    <div className="flex flex-col">
      <img
        className={photo.is_published ? '' : 'opacity-40'}
        src={`${baseUrl}/${photo.storage_prefix}/${thumbWidth}.jpg`}
        alt=""
        width={photo.width}
        height={photo.height}
        loading="lazy"
      />

      <captionFetcher.Form method="post" className="mt-1 flex gap-1">
        <input type="hidden" name="intent" value="photo-caption" />
        <input type="hidden" name="id" value={photo.id} />
        <InputText
          name="caption"
          placeholder="caption"
          className="max-w-full flex-1"
          defaultValue={photo.caption ?? ''}
        />
        <button
          className="cursor-pointer px-1 text-xs"
          type="submit"
          disabled={isSavingCaption}
        >
          {isSavingCaption ? 'saving...' : 'save'}
        </button>
      </captionFetcher.Form>

      <div className="mt-1 flex justify-between text-xs">
        <span className="opacity-60">
          {photo.camera_model ?? ''}
          {photo.iso ? ` • iso ${photo.iso}` : ''}
        </span>

        <span className="flex">
          <button
            className="cursor-pointer px-1"
            type="button"
            disabled={isBusy}
            onClick={() => submit('photo-move-up')}
          >
            ←
          </button>
          <button
            className="cursor-pointer px-1"
            type="button"
            disabled={isBusy}
            onClick={() => submit('photo-move-down')}
          >
            →
          </button>
          <button
            className="text-publish dark:text-publish-dark cursor-pointer px-1"
            type="button"
            disabled={isBusy}
            onClick={() => submit('photo-toggle')}
          >
            {photo.is_published ? 'hide' : 'show'}
          </button>
          <button
            className="text-delete dark:text-delete-dark cursor-pointer px-1"
            type="button"
            disabled={isBusy}
            onClick={() => {
              if (confirm('delete this photo?')) submit('photo-delete')
            }}
          >
            delete
          </button>
        </span>
      </div>
    </div>
  )
}

export const PhotoGrid = ({data, baseUrl}: Props) => {
  return (
    <>
      <p className="mt-7 ml-1.5 font-bold">photos</p>
      <div className="bg-content dark:bg-background-admin-dark mt-1.5 grid grid-cols-2 gap-3 px-3 py-3 md:grid-cols-3">
        {data.map(photo => (
          <PhotoCard photo={photo} baseUrl={baseUrl} key={photo.id} />
        ))}
      </div>
    </>
  )
}
