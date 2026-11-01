import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { SignJWT } from 'jose';
import { createOrderAccessToken, verifyOrderAccessToken } from '../lib/orderAccess.js';
import { verifyLegacyPayUHash } from '../lib/payments/legacyPayu.js';
import { disabledApiResponse } from '../lib/disabledApiResponse.js';

const secret = 'phase-1-test-secret-that-is-long-enough';

test('guest order access token is limited to its order and rejects tampered or expired tokens', async () => {
  process.env.SECRET_KEY = secret;
  const token = await createOrderAccessToken('order-123');

  assert.equal(await verifyOrderAccessToken(token, 'order-123'), true);
  assert.equal(await verifyOrderAccessToken(token, 'order-456'), false);
  assert.equal(await verifyOrderAccessToken(`${token}x`, 'order-123'), false);

  const expiredToken = await new SignJWT({ orderId: 'order-123', purpose: 'guest-order-access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1 second ago')
    .sign(new TextEncoder().encode(secret));
  assert.equal(await verifyOrderAccessToken(expiredToken, 'order-123'), false);
});

test('PayU callback hash is checked strictly and compared safely', () => {
  const data = {
    status: 'success',
    email: 'buyer@example.com',
    firstname: 'Buyer',
    productinfo: 'Narumugai Order',
    amount: '1250.00',
    txnid: 'transaction-123',
    key: 'merchant-key',
  };
  const source = `test-salt|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${data.key}`;
  data.hash = createHash('sha512').update(source).digest('hex');

  assert.equal(verifyLegacyPayUHash(data, 'test-salt'), true);
  assert.equal(verifyLegacyPayUHash({ ...data, amount: '1.00' }, 'test-salt'), false);
  assert.equal(verifyLegacyPayUHash({ ...data, hash: 'invalid' }, 'test-salt'), false);
  assert.equal(verifyLegacyPayUHash(data, ''), false);
});

test('disabled public endpoints return an uncached 410 Gone response', async () => {
  const response = disabledApiResponse('Endpoint disabled.');
  assert.equal(response.status, 410);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { success: false, message: 'Endpoint disabled.' });
});
