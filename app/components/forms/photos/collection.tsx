import {useState} from 'react'
import {Form, useNavigation} from 'react-router'
import {Button} from '~/components/modules'
import {InputText} from '~/components/ui/admin/input-text'
import {Select} from '~/components/ui/admin/select'
import type {PhotoCollection} from '~/models/photos.server'

interface CollectionFormProps {
  handleChange?: () => void
  data?: PhotoCollection
}

export const CollectionForm = ({handleChange, data}: CollectionFormProps) => {
  const navigation = useNavigation()
  const [selected, setSelected] = useState(
    data?.is_published ? 'publish' : 'draft',
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

      <div className="mt-2 flex flex-col">
        <label htmlFor="location" className="mb-1.5">
          location
        </label>
        <InputText
          name="location"
          onChange={handleChange}
          defaultValue={data?.location ?? ''}
        />
      </div>

      <div className="mt-2 flex flex-col">
        <label htmlFor="description" className="mb-1.5">
          description
        </label>
        <InputText
          name="description"
          className="max-w-96"
          onChange={handleChange}
          defaultValue={data?.description ?? ''}
        />
      </div>

      {data && (
        <div className="mt-2 flex flex-col">
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
              handleChange && handleChange()
            }}
          />
        </div>
      )}

      <Button
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
