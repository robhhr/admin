import {useState} from 'react'
import {Form, useNavigation} from 'react-router'
import '@mdxeditor/editor/style.css'
import {Button} from '~/components/modules'
import {InputText} from '~/components/ui/admin/input-text'
import MetaControls from '~/components/ui/admin/meta'
import {Select} from '~/components/ui/admin/select'
import {Editor} from '~/components/ui/admin/editor'

interface ProjectFormProps {
  handleChange: () => void
  setError: () => void
  projectData?: {
    title: string
    status: string
  }
}

export const ProjectForm = ({handleChange, setError}: ProjectFormProps) => {
  const navigation = useNavigation()
  const [selected, setSelected] = useState('draft')

  return (
    <Form method="post" className="mt-4">
      <input type="hidden" name="action" value="login" />

      <div className="flex flex-col">
        <label htmlFor="status" className="mb-1.5">
          status
        </label>

        <Select
          name="status"
          options={[
            {value: 'draft', label: 'draft'},
            {value: 'publish', label: 'publish'},
          ]}
          value={selected}
          onChange={e => {
            setSelected(e.target.value)
            handleChange()
          }}
        />
      </div>

      <div className="mt-2 flex flex-col">
        <label htmlFor="title" className="mb-1.5">
          title
        </label>
        <InputText name="title" onChange={handleChange} />
      </div>

      <div className="mt-4">
        <Editor />
      </div>

      <div className="mt-2 flex flex-col">
        <MetaControls />
      </div>

      <Button
        // disabled={navigation.state === 'submitting'}
        disabled={navigation.state !== 'idle'}
        className="mt-7"
        intent="admin"
        type="submit"
      >
        create
      </Button>
    </Form>
  )
}
