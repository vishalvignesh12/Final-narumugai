import { SignJWT, jwtVerify } from 'jose';

const secret = () => {
    if (!process.env.SECRET_KEY) throw new Error('SECRET_KEY is required to protect order access.');
    return new TextEncoder().encode(process.env.SECRET_KEY);
};

export async function createOrderAccessToken(orderId) {
    return new SignJWT({ orderId: String(orderId), purpose: 'guest-order-access' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30d')
        .sign(secret());
}

export async function verifyOrderAccessToken(token, orderId) {
    try {
        const { payload } = await jwtVerify(token, secret());
        return payload.purpose === 'guest-order-access' && payload.orderId === String(orderId);
    } catch {
        return false;
    }
}
