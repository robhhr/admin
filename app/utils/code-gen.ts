import bcrypt from 'bcryptjs'

export const generateCode = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let code = ''

  for (let i = 0; i < 8; i++) {
    const randomIndex =
      crypto.getRandomValues(new Uint32Array(1))[0] % characters.length
    code += characters.charAt(randomIndex)
  }

  return code.toString()
}

export const hashCode = async (code: string) => {
  const saltRounds = 10
  const hash = await bcrypt.hash(code, saltRounds)

  return hash
}

export const generateHashCode = async () => {
  const code = generateCode()
  const hash = await hashCode(code)

  return {code, hash}
}
