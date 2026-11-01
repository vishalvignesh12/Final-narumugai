import crypto from 'node:crypto';

export function verifyLegacyPayUHash(data, salt) {
    if (!salt || !/^[a-f0-9]{128}$/i.test(data?.hash || '')) return false;
    const source = `${salt}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${data.key}`;
    const expected = crypto.createHash('sha512').update(source).digest();
    const received = Buffer.from(data.hash, 'hex');
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
