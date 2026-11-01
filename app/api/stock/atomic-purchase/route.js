import { disabledApiResponse } from '@/lib/disabledApiResponse';

export async function POST() {
    return disabledApiResponse('Stock can only be reserved during server-side payment initiation.');
}
