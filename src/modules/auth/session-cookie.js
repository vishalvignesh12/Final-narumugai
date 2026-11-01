const HOST_COOKIE_NAME = '__Host-narumugai-session'
const DEVELOPMENT_COOKIE_NAME = 'narumugai_session'
const MAX_DATE_MILLISECONDS = 8_640_000_000_000_000

function validTimestamp(value, label) {
  const milliseconds = value instanceof Date ? value.getTime() : value
  if (
    typeof milliseconds !== 'number' ||
    !Number.isFinite(milliseconds) ||
    Math.abs(milliseconds) > MAX_DATE_MILLISECONDS
  ) {
    throw new TypeError(`${label} must be a valid Date or timestamp.`)
  }
  return milliseconds
}

export function getSessionCookieName(secure) {
  if (typeof secure !== 'boolean') {
    throw new TypeError('secure must be explicitly set to true or false.')
  }
  return secure ? HOST_COOKIE_NAME : DEVELOPMENT_COOKIE_NAME
}

export function getSessionCookieConfig(expiresAt, { now = new Date(), secure } = {}) {
  const name = getSessionCookieName(secure)

  const currentTime = validTimestamp(now, 'now')
  const expirationTime = validTimestamp(expiresAt, 'expiresAt')
  if (expirationTime <= currentTime) {
    throw new RangeError('Session cookie expiry must be in the future.')
  }

  const expires = new Date(expirationTime)
  return {
    name,
    options: {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      expires,
      maxAge: Math.ceil((expirationTime - currentTime) / 1_000),
    },
  }
}
