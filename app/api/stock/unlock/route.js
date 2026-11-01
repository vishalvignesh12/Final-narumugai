import { disabledApiResponse } from '@/lib/disabledApiResponse';

export async function POST() {
    return disabledApiResponse('Stock reservations are released only by the verified payment callback.');
}
