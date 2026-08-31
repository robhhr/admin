import type {Config} from '@react-router/dev/config'

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: true,
  // Railway terminates TLS before forwarding requests to the app. Permit the
  // public origin when React Router compares it with the forwarded request.
  allowedActionOrigins: ['admin.roberto.page'],
} satisfies Config
