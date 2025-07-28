export const TagBox = ({dataTags}) => {
  // console.log(dataTags)
  console.log(dataTags)

  if (!dataTags || dataTags.length === 0) {
    return null
  }

  return (
    <div>
      {dataTags && dataTags.length > 0 && (
        <label htmlFor="tags" className="mb-1.5">
          tags
        </label>
      )}

      {dataTags?.map((tag, i) => (
        <div key={i} className="flex items-center">
          <input
            type="checkbox"
            name="tags"
            value={tag.id}
            // defaultChecked={tags?.includes(tag.id)}
          />
          <span className="ml-2">{tag.name}</span>
        </div>
      ))}
    </div>
  )
}
