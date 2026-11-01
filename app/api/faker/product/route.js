import { disabledApiResponse } from '@/lib/disabledApiResponse';

export async function POST() {
    return disabledApiResponse('Public sample-data generation has been disabled.');
}
