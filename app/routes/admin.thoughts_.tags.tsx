import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router'
import {ControlsThoughts} from '~/components/admin'
import {IconFormDelete} from '~/components/icons'
import {Button} from '~/components/modules'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {InputText} from '~/components/ui/admin/input-text'
import {isUserAuthenticated} from '~/models/auth.server'
import {createTag, deleteTagById, getTags} from '~/models/tags'
import {tryCatch} from '~/utils'

export const loader = async () => {
  const tags = await tryCatch(getTags())

  if (tags.error) {
    console.error('error retrieving tags:', tags.error)
    return {error: tags.error}
  }

  return {tags: tags.data}
}

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const data = Object.fromEntries(formData) as Record<string, string>
  const {action} = data

  switch (action) {
    case 'create':
      if (!data.name) {
        return {error: 'name required'}
      }

      const result = await tryCatch(createTag({name: data.name}))

      if (result.error) {
        console.error('error creating tag:', result.error)
        return {error: 'error creating tag'}
      }

      return {
        success: 'tag created',
        result,
        error: null,
      }

    case 'delete':
      if (!data.id) {
        return {error: 'id required'}
      }

      const del = await tryCatch(deleteTagById({id: data.id}))

      if (del.error) {
        console.error('error deleting tag:', del.error)
        return {error: 'error deleting tag'}
      }

      return {
        success: 'tag deleted',
        del,
        error: null,
      }

    default:
      return {error: 'invalid action'}
  }
}

const AdminThoughtsTags = () => {
  const [title, setTitle] = useState<string | number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const {tags} = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  let createFetcher = useNavigation()

  const isCreating =
    createFetcher.state !== 'idle' &&
    createFetcher.formData?.get('action') === 'create'

  useEffect(() => {
    if (actionData?.success === 'tag created') {
      setTitle('')
    }
  }, [actionData])

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    } else if (actionData?.success) {
      setSuccess(actionData.success)
    }
  }, [actionData])

  return (
    <>
      <ControlsThoughts />

      <Form method="post" className="mt-4 flex flex-col sm:flex-row">
        <input type="hidden" name="action" value="create" />

        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1.5">
            create tag
          </label>

          <InputText
            name="name"
            value={title}
            onChange={e => {
              setTitle(e.target.value)
            }}
            // defaultValue={data ? data.title : ''}
          />
        </div>

        <Button
          disabled={isCreating}
          className="mt-2 h-fit sm:mt-auto sm:ml-2"
          intent="admin"
          type="submit"
        >
          create
        </Button>
      </Form>

      {tags && (
        <div className="mt-8 flex flex-wrap">
          {tags.map(tag => {
            return (
              <div
                key={tag.id}
                className="bg-background dark:bg-background-dark shadow-window mt-2 mr-2 flex w-fit items-center"
              >
                <Form method="post" className="flex items-center">
                  <input type="hidden" name="action" value="delete" />
                  <input type="hidden" name="id" value={tag.id} />
                  <button
                    disabled={false}
                    className="flex h-fit cursor-pointer items-center px-2 py-0.5"
                    type="submit"
                  >
                    {tag.name}

                    <span className="ml-1">
                      <IconFormDelete />
                    </span>
                  </button>
                </Form>
              </div>
            )
          })}
        </div>
      )}

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </>
  )
}

export default AdminThoughtsTags
