export function isV2ApiEnabled(env = process.env) {
    return env.ENABLE_V2_API === 'true';
}
