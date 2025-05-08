'use client'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

// Form validation schema
const authSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormValues = z.infer<typeof authSchema>;


export function AuthForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form definition
    const form = useForm<FormValues>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    // Handle login
    const handleLogin = async (values: FormValues) => {
        setIsLoading(true);
        try {
            // Determine if username is an email or username
            const isEmail = values.username.includes('@');

            // Use better-auth signIn.email function
            const { data, error } = await authClient.signIn.email({
                email: isEmail ? values.username : '',
                password: values.password,
            });

            if (error) {
                toast.error(error.message || 'Login failed');
                setIsLoading(false);
                return;
            }

            if (data) {
                console.log("Login successful, session data:", data);
                toast.success('Login successful');
                window.location.href = '/dashboard';
            }
        } catch (error: any) {
            console.error("Login error:", error);
            toast.error(error?.message || 'An error occurred during login');
            setIsLoading(false);
        }
    };

    // Handle signup
    const handleSignup = async (values: FormValues) => {
        setIsLoading(true);
        try {
            // Determine if username is an email or username
            const isEmail = values.username.includes('@');

            // Use better-auth signUp.email function
            const { data, error } = await authClient.signUp.email({
                email: isEmail ? values.username : '',
                name: isEmail ? values.username : '',
                password: values.password
            });

            if (error) {
                toast.error(error.message || 'Signup failed');
                setIsLoading(false);
                return;
            }

            if (data) {
                toast.success('Account created successfully');
                // Automatically log in after successful signup
                await handleLogin(values);
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred during signup');
            setIsLoading(false);
        }
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-purple-800 text-center">
                    Dream Journal
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(handleLogin)}>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-purple-700">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your email"
                                            className="border-purple-200 focus:border-purple-400"
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-purple-700">Password</FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                className="border-purple-200 focus:border-purple-400 pr-10"
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="h-4 w-4"/>
                                            ) : (
                                                <EyeIcon className="h-4 w-4"/>
                                            )}
                                        </Button>
                                    </div>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex space-x-4 pt-2">
                            <Button
                                type="submit"
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : 'Log In'}
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200"
                                disabled={isLoading}
                                onClick={form.handleSubmit(handleSignup)}
                            >
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}