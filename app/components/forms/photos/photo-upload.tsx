import {Form, useNavigation} from 'react-router'
import {Button} from '~/components/modules'

export const PhotoUploadForm = () => {
  const navigation = useNavigation()
  const isUploading =
    navigation.state !== 'idle' &&
    navigation.formData?.get('intent') === 'upload'

  return (
    <Form method="post" encType="multipart/form-data" className="mt-7">
      <input type="hidden" name="intent" value="upload" />

      <div className="flex flex-col">
        <label htmlFor="files" className="mb-1.5">
          photos
        </label>
        <input
          className="w-fit cursor-pointer text-xs"
          type="file"
          name="files"
          multiple
          accept=".jpg,.jpeg,.raf,.nef,image/jpeg"
        />
        <p className="mt-1 text-xs opacity-60">
          raf / nef / jpeg — batches of ~5-8 work best, raws take a few seconds
          each
        </p>
      </div>

      <Button
        disabled={navigation.state !== 'idle'}
        className="mt-4"
        intent="admin"
        type="submit"
      >
        {isUploading ? 'uploading...' : 'upload'}
      </Button>
    </Form>
  )
}
