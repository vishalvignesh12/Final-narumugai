import assert from 'node:assert/strict';
import test from 'node:test';
import { catchError, response } from '../lib/apiResponse.js';
import { isV2ApiEnabled } from '../lib/apiVersioning.js';
import { shouldClearSessionForStatus } from '../lib/authStatus.js';

test('response helper keeps HTTP status and JSON statusCode aligned', async () => {
  const unauthorized = response(false, 401, 'Unauthorized.');
  assert.equal(unauthorized.status, 401);
  assert.equal((await unauthorized.json()).statusCode, 401);

  const invalid = response(false, 400, 'Invalid input.');
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).statusCode, 400);
});

test('error helper maps duplicate keys and validation failures to client statuses', async () => {
  const duplicate = catchError({ code: 11000, keyPattern: { email: 1 }, message: 'duplicate' });
  assert.equal(duplicate.status, 409);
  assert.equal((await duplicate.json()).statusCode, 409);

  const invalid = catchError(Object.assign(new Error('invalid input'), { name: 'ValidationError' }));
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).statusCode, 400);
});

test('unknown error codes cannot become invalid HTTP status values', async () => {
  const response = catchError(Object.assign(new Error('database failure'), { code: 999999 }));
  assert.equal(response.status, 500);
  assert.equal((await response.json()).statusCode, 500);
});

test('PostgreSQL V2 stays disabled unless explicitly enabled', () => {
  assert.equal(isV2ApiEnabled({}), false);
  assert.equal(isV2ApiEnabled({ ENABLE_V2_API: 'false' }), false);
  assert.equal(isV2ApiEnabled({ ENABLE_V2_API: 'true' }), true);
});

test('only an unauthenticated response clears the session cookie', () => {
  assert.equal(shouldClearSessionForStatus(401), true);
  assert.equal(shouldClearSessionForStatus(403), false);
  assert.equal(shouldClearSessionForStatus(500), false);
});
