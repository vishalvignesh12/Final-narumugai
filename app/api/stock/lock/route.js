import { disabledApiResponse } from '@/lib/disabledApiResponse';

export async function POST() {
    return disabledApiResponse('Stock is reserved only during server-side payment initiation.');
}
