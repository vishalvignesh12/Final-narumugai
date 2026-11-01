import { isAuthenticated } from '@/lib/authentication';
import { connectDB } from '@/lib/databaseConnection';
import { catchError, response } from '@/lib/helperFunction';
import UserModel from '@/models/User.model';

export async function GET() {
  try {
    const auth = await isAuthenticated(['user', 'admin']);
    if (!auth.isAuth) return response(false, 401, 'Unauthenticated.');
    await connectDB();

    const user = await UserModel.findOne({ _id: auth.userId, role: auth.role, deletedAt: null })
      .select('name email phone avatar role')
      .lean();
    if (!user) return response(false, 401, 'Unauthenticated.');

    const result = response(true, 200, 'Session active.', {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
    });
    result.headers.set('Cache-Control', 'private, no-store');
    return result;
  } catch (error) {
    return catchError(error);
  }
}
