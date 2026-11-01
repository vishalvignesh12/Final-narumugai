import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

function sha512(value) { return createHash('sha512').update(value).digest('hex') }
function moneyFromPaise(amountPaise) { return (amountPaise / 100).toFixed(2) }

function formHash(fields, salt) {
  return sha512(`${fields.key}|${fields.txnid}|${fields.amount}|${fields.productinfo}|${fields.firstname}|${fields.email}|||||||||||${salt}`)
}

export function verifyPayUResponse(fields, { key, salt }) {
  if (!key || !salt || fields.key !== key || typeof fields.hash !== 'string' || !/^[a-f0-9]{128}$/i.test(fields.hash)) return false
  const source = `${salt}|${fields.status}|||||||||||${fields.email}|${fields.firstname}|${fields.productinfo}|${fields.amount}|${fields.txnid}|${fields.key}`
  const expected = Buffer.from(sha512(source), 'hex')
  const received = Buffer.from(fields.hash, 'hex')
  return expected.length === received.length && timingSafeEqual(expected, received)
}

export function createPayUProvider({ key, salt, endpoint, baseUrl, statusEndpoint: configuredStatusEndpoint }) {
  if (!key || !salt || !endpoint || !baseUrl) throw new TypeError('PayU configuration is incomplete.')
  return {
    createCheckoutForm({ order, payment }) {
      const fields = {
        key,
        txnid: payment.providerReference || randomBytes(16).toString('hex'),
        amount: moneyFromPaise(payment.amountPaise),
        productinfo: `Narumugai order ${order.orderNumber}`,
        firstname: order.contactName.trim().split(/\s+/)[0],
        email: order.contactEmail || 'customer@narumugai.com',
        phone: order.contactPhone,
        surl: `${baseUrl}/api/v2/payments/payu/callback`,
        furl: `${baseUrl}/api/v2/payments/payu/callback`,
      }
      fields.hash = formHash(fields, salt)
      return { endpoint, fields }
    },
    verifyResponse(fields) { return verifyPayUResponse(fields, { key, salt }) },
    async getTransactionStatus(transactionId, { fetchImpl = fetch, statusEndpoint = configuredStatusEndpoint } = {}) {
      if (!/^[A-Za-z0-9_-]{1,40}$/.test(transactionId)) throw new TypeError('Invalid PayU transaction reference.')
      const host = new URL(endpoint).hostname
      const url = statusEndpoint || (host === 'test.payu.in'
        ? 'https://test.payu.in/merchant/postservice?form=2'
        : 'https://info.payu.in/merchant/postservice.php?form=2')
      const requestHash = sha512(`${key}|verify_payment|${transactionId}|${salt}`)
      const payload = new URLSearchParams({ key, command: 'verify_payment', var1: transactionId, hash: requestHash })
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: payload,
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error('PayU status lookup failed.')
      const body = await response.json()
      if (body?.status !== 1 || !body?.transaction_details?.[transactionId]) return { status: 'unknown' }
      const transaction = body.transaction_details[transactionId]
      return {
        status: String(transaction.status || 'unknown').toLowerCase(),
        amount: transaction.amt || transaction.transaction_amount,
        mihpayid: transaction.mihpayid,
      }
    },
  }
}

export function createPayUProviderFromEnv(env = process.env) {
  return createPayUProvider({
    key: env.PAYU_KEY,
    salt: env.PAYU_SALT,
    endpoint: env.PAYU_ENDPOINT,
    statusEndpoint: env.PAYU_STATUS_ENDPOINT,
    baseUrl: env.NEXT_PUBLIC_BASE_URL || 'https://narumugai.com',
  })
}
