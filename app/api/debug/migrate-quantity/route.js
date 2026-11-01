import { disabledApiResponse } from '@/lib/disabledApiResponse';

export async function POST() {
    return disabledApiResponse('This one-off migration endpoint has been disabled.');
}
