'use client'
import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {z} from 'zod';
import {useAuth} from '@/lib/authProvider';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {EyeIcon, EyeOffIcon} from 'lucide-react';
import {useRouter} from "next/navigation";

// Form validation schemaa
const authSchema = z.object({
    username: z.string().min(3, {message: 'Username must be at least 3 characters'}),
    password: z.string().min(6, {message: 'Password must be at least 6 characters'}),
});

type FormValues = z.infer<typeof authSchema>;

// Add redirectPath prop
interface AuthFormProps {
    redirectPath?: string | null;
}

export function AuthForm({ redirectPath }: AuthFormProps = {}) {
    const router = useRouter();
    const {login, signup} = useAuth();
    const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);
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

    // Handle form submission
// Handle form submission
    const onSubmit = async (action: 'login' | 'signup') => {
        const {username, password} = form.getValues();

        // Validate form manually
        if (!username || !password) {
            setMessage({text: 'Username and password are required', success: false});
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            if (action === 'login') {
                // Log the redirect path for debugging
                console.log("Login with redirect path:", redirectPath);

                // Pass redirectPath to login function
                const result = await login(username, password, redirectPath || undefined);

                // Set success/error message but don't navigate - the login function will handle that
                setMessage({text: result.message, success: result.success});
            } else {
                // For signup
                const result = await signup(username, password);
                setMessage({text: result.message, success: result.success});

                if (result.success) {
                    // After successful signup, log the user in
                    await login(username, password, redirectPath || undefined);
                }
            }
        } catch (error) {
            setMessage({
                text: 'An error occurred. Please try again.',
                success: false
            });
        } finally {
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
                    <form className="space-y-4">
                        {/* Show success/error message */}
                        {message && (
                            <div
                                className={`p-3 rounded-md ${
                                    message.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}
                            >
                                {message.text}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="username"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-sm font-medium text-purple-700">Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Enter your username"
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
                                type="button"
                                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={isLoading}
                                onClick={() => {
                                    form.handleSubmit(async () => {
                                        await onSubmit('login');
                                    })();
                                }}
                            >
                                Log In
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-200"
                                disabled={isLoading}
                                onClick={() => {
                                    form.handleSubmit(async () => {
                                        await onSubmit('signup');
                                    })();
                                }}
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