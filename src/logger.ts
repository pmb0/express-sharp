import debug from 'debug'

export const log = debug('express-sharp')

export function getLogger(ns: string) {
  return log.extend(ns)
}
