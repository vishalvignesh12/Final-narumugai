import { createHash, randomBytes } from 'node:crypto'

const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/
const SESSION_TOKEN_BYTES = 32

export function createSessionToken() {
  const token = randomBytes(SESSION_TOKEN_BYTES).toString('base64url')

  return {
    token,
    tokenHash: hashSessionToken(token),
  }
}

export function hashSessionToken(token) {
  if (typeof token !== 'string' || !SESSION_TOKEN_PATTERN.test(token)) {
    throw new TypeError('Session token must be a canonical 256-bit base64url token.')
  }

  const decoded = Buffer.from(token, 'base64url')
  if (decoded.length !== SESSION_TOKEN_BYTES || decoded.toString('base64url') !== token) {
    throw new TypeError('Session token must be a canonical 256-bit base64url token.')
  }

  return createHash('sha256').update(token, 'utf8').digest('hex')
}
