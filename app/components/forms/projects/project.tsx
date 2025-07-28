import {useState} from 'react'
import {Form, useNavigation} from 'react-router'
import {TagBox} from '../tags'
import '@mdxeditor/editor/style.css'
import {Button} from '~/components/modules'
import {Editor} from '~/components/ui/admin/editor'
import {InputText} from '~/components/ui/admin/input-text'
import MetaControls from '~/components/ui/admin/meta'
import {Select} from '~/components/ui/admin/select'
import type {ProjectEdit} from '~/models/projects.server'

interface ProjectFormProps {
  handleChange: () => void
  setError: () => void
  projectData?: ProjectEdit
  tags?: {id: number; name: string}[]
}

export const ProjectForm = ({
  handleChange,
  setError,
  projectData,
  tags,
}: ProjectFormProps) => {
  const navigation = useNavigation()
  const [selected, setSelected] = useState(
    projectData ? projectData.status.toString() : 'draft',
  )
  const dataTags = projectData ? projectData.tags : tags.data

  return (
    <Form method="post" className="mt-4">
      <input
        type="hidden"
        name="action"
        value={projectData ? 'update' : 'create'}
      />

      <div className="flex flex-col">
        <label htmlFor="status" className="mb-1.5">
          status
        </label>

        <Select
          name="status"
          options={[
            {value: 'draft', label: 'draft'},
            {value: 'publish', label: 'publish'},
            ...(projectData ? [{value: 'archive', label: 'archive'}] : []),
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
        <InputText
          name="title"
          onChange={handleChange}
          defaultValue={projectData ? projectData.title : ''}
        />
      </div>

      <div className="mt-4 p-4">
        <Editor data={projectData && projectData.content} />
      </div>

      <div className="mt-2 flex flex-col">
        <MetaControls metadata={projectData && projectData.metadata} />
      </div>

      <div className="mt-2 flex flex-col">
        <TagBox dataTags={dataTags} />
      </div>

      <Button
        // disabled={navigation.state === 'submitting'}
        disabled={navigation.state !== 'idle'}
        className="mt-7"
        intent="admin"
        type="submit"
      >
        {projectData ? 'update' : 'create'}
      </Button>
    </Form>
  )
}
