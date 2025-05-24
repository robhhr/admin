import {useState} from 'react'
import {Form, useNavigation} from 'react-router'
import {Button} from '~/components/modules'
import {Editor} from '~/components/ui/admin/editor'
import {InputText} from '~/components/ui/admin/input-text'
import {Select} from '~/components/ui/admin/select'
import type {ThoughtProps} from '~/models/thoughts.server'

interface ThoughtFormProps {
  handleChange?: () => void
  data?: ThoughtProps
}

export const ThoughtForm = ({handleChange, data}: ThoughtFormProps) => {
  const navigation = useNavigation()
  const [selected, setSelected] = useState(
    data ? data.status.toString() : 'draft',
  )

  return (
    <Form method="post" className="mt-4">
      <input type="hidden" name="action" value={data ? 'update' : 'create'} />

      <div className="flex flex-col">
        <label htmlFor="title" className="mb-1.5">
          title
        </label>
        <InputText
          name="title"
          onChange={handleChange}
          defaultValue={data ? data.title : ''}
        />
      </div>

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
