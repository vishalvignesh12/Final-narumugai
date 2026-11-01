export function disabledApiResponse(message) {
    return Response.json(
        { success: false, message },
        { status: 410, headers: { 'Cache-Control': 'no-store' } }
    );
}
