import {PhotoCollectionItem} from './photo-collection-item'
import type {PhotoCollection} from '~/models/photos.server'

interface Props {
  data: PhotoCollection[]
  title: string
}

export const PhotoCollectionListing = ({title, data}: Props) => {
  return (
    <>
      <p className="mt-4 ml-1.5 font-bold">{title}</p>
      <div className="bg-content dark:bg-background-admin-dark mt-1.5 px-3 py-1.5">
        {data.map(collection => {
          return <PhotoCollectionItem data={collection} key={collection.id} />
        })}
      </div>
    </>
  )
}
