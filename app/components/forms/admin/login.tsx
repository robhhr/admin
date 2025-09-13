import {useState} from 'react'
import {Form} from 'react-router'
import {cx} from 'class-variance-authority'
import {IconCheckmark} from '~/components/icons/checkmark'
import {IconEye, IconEyeClose} from '~/components/icons/eye'
import {Button} from '~/components/modules/button'
import {InputText} from '~/components/ui/admin/input-text'
import {TitleBar} from '~/components/ui/admin/title-bar'
import type {LoginFormProps} from '~/types/admin/forms'

export const LoginForm = ({
  fingerprint,
  onChange,
  toggleRemember,
  remember,
}: LoginFormProps) => {
  const [togglePassword, setTogglePassword] = useState<boolean>(false)

  const togglePasswordVisibility = () => {
    setTogglePassword(!togglePassword)
  }

  const handleRememberToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleRemember()
  }

  return (
    <div className="bg-silver dark:bg-silver-dark shadow-window flex w-full max-w-96 flex-col p-[3px]">
      <TitleBar title="admin" />

      <Form method="post" className="m-2">
        <input type="hidden" name="action" value="login" />

        <div className="font-ms-sans-serif flex flex-col text-xs">
          <label htmlFor="username" className="mb-1.5">
            username
          </label>
          <InputText name="username" onChange={onChange} />
        </div>

        <div className="font-ms-sans-serif mt-2 flex flex-col text-xs">
          <label htmlFor="password" className="mb-1.5">
            password
          </label>

          <div className="relative w-fit">
            <InputText
              name="password"
              type={togglePassword ? 'text' : 'password'}
              className="pr-6"
              onChange={onChange}
            />

            <span
              aria-hidden
              className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer"
              onClick={e => {
                e.preventDefault()
                togglePasswordVisibility()
              }}
            >
              {togglePassword ? <IconEyeClose /> : <IconEye />}
            </span>
          </div>
        </div>

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

        <div className="font-ms-sans-serif my-2.5 flex items-center text-xs">
          <button
            type="button"
            aria-label="remember me"
            onClick={handleRememberToggle}
            className={cx(
              'shadow-input flex h-3.5 w-3.5 cursor-pointer items-center justify-center',
              'inset-input bg-white',
            )}
          >
            {remember && <IconCheckmark />}
          </button>
          <span className="ml-1">remember me</span>
        </div>

        <input
          type="hidden"
          name="remember"
          value={remember ? 'true' : 'false'}
        />

        <Button intent="admin" type="submit">
          login
        </Button>
      </Form>
    </div>
  )
}
