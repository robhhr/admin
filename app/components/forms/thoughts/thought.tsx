import {useState} from 'react'
import {Form, useNavigation} from 'react-router'
import {TagBox} from '../tags'
import {Button} from '~/components/modules'
import {Editor} from '~/components/ui/admin/editor'
import {Select} from '~/components/ui/admin/select'
import type {ThoughtWithTags} from '~/models/thoughts.server'
import type {TagProps} from '~/models/tags'

interface ThoughtFormProps {
  handleChange?: () => void
  data?: ThoughtWithTags
  tags?: TagProps[]
}

export const ThoughtForm = ({handleChange, data, tags}: ThoughtFormProps) => {
  const navigation = useNavigation()
  const [selected, setSelected] = useState(
    data ? data.status.toString() : 'draft',
  )
  const dataTags =
    data?.tags ?? tags?.map(tag => ({...tag, is_selected: false})) ?? []

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

      <TagBox dataTags={dataTags} />

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
