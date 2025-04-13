import {useCallback, useState} from 'react'

export interface FingerprintData {
  userAgent: string
  language: string
  timezone: string
  hardwareConcurrency: number | 'unknown'
  webglFingerprint: string | 'unsupported'
}

export interface FingerprintResult {
  data: FingerprintData
  hash: string
}

async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

const useFingerprint = () => {
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(null)

  const generateFingerprint = useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined')
      return

    let webglFingerprint: string | 'unsupported' = 'unsupported'
    try {
      const webglCanvas = document.createElement('canvas')
      const gl = webglCanvas.getContext('webgl') as WebGLRenderingContext | null
      if (gl) {
        const vendor = gl.getParameter(gl.VENDOR)
        const renderer = gl.getParameter(gl.RENDERER)
        webglFingerprint = `${vendor} ${renderer}`
      }
    } catch (error) {
      console.warn('WebGL fingerprinting is unsupported in this environment.')
    }

    // collect data
    const fingerprintData: FingerprintData = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      webglFingerprint,
    }

    const fingerprintString = JSON.stringify(fingerprintData)
    const hashedFingerprint = await hashData(fingerprintString)

    const result: FingerprintResult = {
      data: fingerprintData,
      hash: hashedFingerprint,
    }

    setFingerprint(result)
    return result
  }, [])

  return {fingerprint, generateFingerprint}
}

export default useFingerprint

