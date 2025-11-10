'use client'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { zSchema } from '@/lib/zodSchema'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { useState } from 'react'

// 1. Define the validation schema
const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: zSchema.password, // Use your existing strong password schema
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"] // Show error on the confirm field
});

const ChangePasswordForm = () => {
    const [loading, setLoading] = useState(false);

    // 2. Setup the form
    const form = useForm({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            oldPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    // 3. Handle form submission
    const onSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            };
            const { data } = await axios.post('/api/profile/change-password', payload);

            if (data.success) {
                showToast('success', data.message);
                form.reset();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account's password here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Old Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter your old password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Enter your new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="Confirm your new password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <ButtonLoading type="submit" text="Change Password" loading={loading} />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default ChangePasswordForm;