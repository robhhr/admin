import {useEffect, useState} from 'react'
import {
  type ActionFunctionArgs,
  Form,
  type LoaderFunctionArgs,
  redirect,
  useActionData,
  useLoaderData,
} from 'react-router'
import {Button} from '~/components/modules'
import {FeedbackDialog} from '~/components/ui/admin/dialog'
import {InputText} from '~/components/ui/admin/input-text'
import {isUserAuthenticated} from '~/models/auth.server'
import {
  disableTOTP,
  generateQRCode,
  generateTOTPSecret,
  isTOTPEnabled,
  saveTOTPSecret,
  verifyTOTPCode,
} from '~/models/totp.server'
import {getSession} from '~/session.server'
import {tryCatch} from '~/utils'

export const loader = async ({request}: LoaderFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')

  if (!userId) {
    return redirect('/login')
  }

  const totpEnabled = await isTOTPEnabled(userId)

  if (!totpEnabled) {
    const username = (session.get('username') as string | undefined) ?? 'sroot'

    const {secret, otpauthURL} = generateTOTPSecret(username)
    const qrCode = await generateQRCode(otpauthURL)

    return {
      totpEnabled: false,
      secret,
      qrCode,
    }
  }

  return {
    totpEnabled: true,
    secret: null,
    qrCode: null,
  }
}

export const action = async ({request}: ActionFunctionArgs) => {
  const isAuth = await isUserAuthenticated(request)

  if (!isAuth) {
    return redirect('/login')
  }

  const session = await getSession(request.headers.get('Cookie'))
  const userId = session.get('userId')

  if (!userId) {
    return redirect('/login')
  }

  const formData = await request.formData()
  const action = formData.get('action') as string

  switch (action) {
    case 'enable': {
      const code = formData.get('code') as string
      const secret = formData.get('secret') as string

      if (!code) {
        return {error: 'code required'}
      }

      if (!secret) {
        return {error: 'secret missing'}
      }

      const isValid = verifyTOTPCode(secret, code)

      if (!isValid) {
        return {error: 'invalid code - please try again'}
      }

      const result = await tryCatch(saveTOTPSecret(userId, secret, true))

      if (result.error) {
        console.error('error saving TOTP secret:', result.error)
        return {error: 'error enabling TOTP'}
      }

      return {success: 'TOTP enabled successfully'}
    }

    case 'disable': {
      const result = await tryCatch(disableTOTP(userId))

      if (result.error) {
        console.error('error disabling TOTP:', result.error)
        return {error: 'error disabling TOTP'}
      }

      return redirect('/admin/settings/totp')
    }

    default:
      return {error: 'invalid action'}
  }
}

const AdminSettingsTOTP = () => {
  const loaderData = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (actionData?.error) {
      setError(actionData.error)
    } else if (actionData?.success) {
      setSuccess(actionData.success)
    }
  }, [actionData])

  const handleChange = () => setError(null)

  if (loaderData.totpEnabled) {
    return (
      <div className="max-w-2xl">
        <div className="bg-silver dark:bg-silver-dark shadow-window mb-4 p-4">
          <p className="text-green-700 dark:text-green-400">
            ✓ TOTP is currently enabled
          </p>
        </div>

        <Form method="post">
          <input type="hidden" name="action" value="disable" />
          <Button intent="admin" type="submit" className="bg-red-600">
            disable TOTP
          </Button>
        </Form>

        <FeedbackDialog
          actionData={error ? {error} : success ? {success} : undefined}
        />
      </div>
    )
  }

  // this is only for local when first code is created, musn't show in prod ever
  return (
    <div className="max-w-2xl">
      <div className="bg-silver dark:bg-silver-dark shadow-window mb-6 p-4">
        <h3 className="mb-3 font-bold">scan QR code</h3>
        {loaderData.qrCode && (
          <div className="mb-4 flex justify-center">
            <img
              src={loaderData.qrCode}
              alt="TOTP QR Code"
              className="border-2 border-gray-300 dark:border-gray-600"
            />
          </div>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-xs text-gray-600 dark:text-gray-400">
            enter manually
          </summary>
          <div className="mt-2 bg-gray-100 p-2 font-mono text-xs break-all dark:bg-gray-800">
            {loaderData.secret}
          </div>
        </details>
      </div>

      <div className="bg-silver dark:bg-silver-dark shadow-window mb-6 p-4">
        <h3 className="mb-3 font-bold">verify code</h3>
        <Form method="post" className="flex flex-col">
          <input type="hidden" name="action" value="enable" />
          <input type="hidden" name="secret" value={loaderData.secret || ''} />

          <div className="flex flex-col">
            <label htmlFor="code" className="mb-1.5 text-sm">
              6-digit code
            </label>
            <InputText
              name="code"
              onChange={handleChange}
              placeholder="000000"
              maxLength={6}
              pattern="[0-9]{6}"
            />
          </div>

          <Button intent="admin" type="submit" className="mt-4">
            verify and enable TOTP
          </Button>
        </Form>
      </div>

      <FeedbackDialog
        actionData={error ? {error} : success ? {success} : undefined}
      />
    </div>
  )
}

export default AdminSettingsTOTP
