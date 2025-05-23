// logic from https://github.com/uuidjs/uuid
import REGEX from './regex'

export const validateUUID = (uuid: unknown) => {
  return typeof uuid === 'string' && REGEX.test(uuid)
}
