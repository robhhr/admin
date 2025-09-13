import {Form} from 'react-router'
import {Button} from '~/components/modules/button'
import {InputText} from '~/components/ui/admin/input-text'
import {TitleBar} from '~/components/ui/admin/title-bar'
import type {CodeAuthFormProps} from '~/types/admin/forms'

export const CodeAuthForm = ({fingerprint}: CodeAuthFormProps) => {
  return (
    <div className="bg-silver dark:bg-silver-dark shadow-window flex w-full max-w-96 flex-col p-[3px]">
      <TitleBar title="2FA" />

      <Form method="post" className="m-2 flex flex-col">
        <input type="hidden" name="action" value="2FA" />
        <input
          type="hidden"
          name="fingerprint"
          value={fingerprint?.hash || ''}
        />
        <input
          type="hidden"
          name="fingerprintData"
          value={fingerprint ? JSON.stringify(fingerprint.data) : ''}
        />
        <label htmlFor="code" className="font-ms-sans-serif mb-1.5 text-xs">
          code
        </label>
        <InputText name="code" />
        <Button intent="admin" type="submit" className="my-2.5">
          login
        </Button>
      </Form>
    </div>
  )
}
