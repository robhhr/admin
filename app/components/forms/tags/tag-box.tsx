import {useState} from 'react'
import {IconFormDelete} from '~/components/icons'
import type {TagPropsWithStatus} from '~/models/tags'

export const TagBox = ({dataTags}: {dataTags: TagPropsWithStatus[]}) => {
  const [tags, setTags] = useState(dataTags || [])

  const handleTagClick = (tagId: number) => {
    setTags(currentTags =>
      currentTags.map(tag =>
        tag.id === tagId ? {...tag, is_selected: !tag.is_selected} : tag,
      ),
    )
  }

  if (tags.length === 0) {
    return (
      <div>
        <label htmlFor="tags" className="mb-1.5 block">
          tags
        </label>
        <p className="text-sm text-gray-500">No tags available.</p>
      </div>
    )
  }

  return (
    <div>
      <label htmlFor="tags" className="mb-1.5 block">
        tags
      </label>

      <div className="flex flex-wrap">
        {tags.map(tag => (
          <div
            key={tag.id}
            onClick={() => handleTagClick(tag.id)}
            className={`shadow-window mt-2 mr-2 flex w-fit cursor-pointer items-center px-2 py-0.5 ${
              tag.is_selected
                ? 'bg-background hover:bg-background/70 text-text'
                : 'bg-background-admin hover:bg-background-admin/70'
            }`}
          >
            <span>{tag.name}</span>
            {tag.is_selected && (
              <span className="ml-1.5">
                <IconFormDelete />
              </span>
            )}
          </div>
        ))}
      </div>

      {tags
        .filter(tag => tag.is_selected)
        .map(tag => (
          <input
            key={`input-${tag.id}`}
            type="hidden"
            name="tags"
            value={tag.id}
          />
        ))}
    </div>
  )
}
