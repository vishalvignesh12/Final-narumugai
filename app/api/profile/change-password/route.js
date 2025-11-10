import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import bcrypt from 'bcryptjs';
import { z } from "zod";

export async function POST(request) {
    try {
        await connectDB();

        // 1. Authenticate the user from their token
        const auth = await isAuthenticated('user');
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized. Please log in again.');
        }

        // 2. Validate the incoming passwords
        const validationSchema = z.object({
            oldPassword: z.string().min(1, "Old password is required"),
            newPassword: zSchema.password // Use your existing strong password schema
        });

        const payload = await request.json();
        const validatedData = validationSchema.safeParse(payload);

        if (!validatedData.success) {
            return response(false, 400, 'Invalid fields', validatedData.error);
        }

        const { oldPassword, newPassword } = validatedData.data;

        // 3. Get the user from the database (selecting the password)
        const user = await UserModel.findById(auth.user._id).select("+password");
        if (!user) {
            return response(false, 404, 'User not found.');
        }

        // 4. Verify the OLD password is correct
        const isPasswordVerified = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordVerified) {
            return response(false, 400, 'Incorrect old password.');
        }

        // 5. Save the NEW password (the .save() hook will hash it)
        user.password = newPassword;
        await user.save();

        return response(true, 200, 'Password changed successfully.');

    } catch (error) {
        return catchError(error);
    }
}