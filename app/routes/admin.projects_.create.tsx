import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  Form,
  redirect,
  useActionData,
  useNavigation,
} from 'react-router'
import {ControlsProjects} from '~/components/admin'
import {Button} from '~/components/modules/button'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {InputText} from '~/components/ui/admin/input-text'
import MetaControls from '~/components/ui/admin/meta'
import {Select} from '~/components/ui/admin/select'
import MarkdownEditor from '~/components/ui/admin/text-editor'
import {isUserAuthenticated} from '~/models/auth.server'
import {createProject} from '~/models/projects.server'

// import type {CreateProjectFormProps} from '~/types/admin/forms'

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const body = await request.formData()
  const status = body.get('status') as 'draft' | 'publish'
  const title = body.get('title') as string
  const content = body.get('content') as string
  const meta = body.get('meta') as string

  // NOTE: meta excluded since its optional & status has default value
  if (!title) return {error: 'title required'}
  if (!content) return {error: 'content required'}

  try {
    const result = await createProject({status, title, content, meta})
    return {
      success: 'project created',
      result,
    }
  } catch (error) {
    console.error('error inserting project:', error)
    return {error: 'error creating project'}
  }
}

const DashboardProjectsCreate = () => {
  const [selected, setSelected] = useState('draft')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigation = useNavigation()
  const actionData = useActionData<typeof action>()
  // console.log(actionData, ' actionData')
  // console.log(actionData && JSON.parse(actionData.meta))

  // console.log(navigation)
  console.log(actionData, ' actionData')

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    } else if (actionData?.success) {
      setSuccess(actionData.success)
    }
  }, [actionData])

  const handleChange = () => setError(null)

  return (
    <>
      <ControlsProjects />

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

        <div className="mt-2 mb-2.5 flex flex-col">
          <MarkdownEditor setError={setError} />
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

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default DashboardProjectsCreate
