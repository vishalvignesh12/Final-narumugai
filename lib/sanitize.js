export function sanitizeGatewayText(value, max = 500) {
    return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max) || 'Unknown'
}
