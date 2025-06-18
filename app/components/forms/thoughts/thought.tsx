import {useState} from 'react'
import {Form, useNavigation} from 'react-router'
import {Button} from '~/components/modules'
import {Editor} from '~/components/ui/admin/editor'
import {Select} from '~/components/ui/admin/select'
import type {TagProps} from '~/models/tags'
import type {ThoughtProps} from '~/models/thoughts.server'

interface ThoughtFormProps {
  handleChange?: () => void
  data?: ThoughtProps
  tags?: TagProps[]
}

export const ThoughtForm = ({handleChange, data, tags}: ThoughtFormProps) => {
  const navigation = useNavigation()
  const [selected, setSelected] = useState(
    data ? data.status.toString() : 'draft',
  )
  const isCreate = data === undefined
  const arr = isCreate ? tags : data.tags
  // const fetcher = useFetcher()

  return (
    <Form method="post" className="mt-4">
      <input type="hidden" name="action" value={data ? 'update' : 'create'} />

      <div className="flex flex-col">
        <label htmlFor="status" className="mb-1.5">
          status
        </label>

        <Select
          name="status"
          options={[
            {value: 'draft', label: 'draft'},
            {value: 'publish', label: 'publish'},
            ...(data ? [{value: 'archive', label: 'archive'}] : []),
          ]}
          value={selected}
          onChange={e => {
            setSelected(e.target.value)
            handleChange && handleChange()
          }}
        />
      </div>

      <div className="mt-2 p-4">
        <Editor data={data && data.content} />
      </div>

      {/*TODO: tags*/}
      <div>
        {arr && arr.length > 0 && (
          <label htmlFor="tags" className="mb-1.5">
            tags
          </label>
        )}

        {arr?.map((tag, i) => (
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

      <Button
        // disabled={navigation.state === 'submitting'}
        disabled={navigation.state !== 'idle'}
        className="mt-7"
        intent="admin"
        type="submit"
      >
        {data ? 'update' : 'create'}
      </Button>
    </Form>
  )
}
