import { disabledApiResponse } from '@/lib/disabledApiResponse';

export async function GET() {
    return disabledApiResponse('This test endpoint has been disabled.');
}
