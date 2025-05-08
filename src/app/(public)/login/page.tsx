'use client'
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/lib/authProvider';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect');

    // Store redirect in state to pass to AuthForm
    const [redirectTo, setRedirectTo] = useState<string | null>(null);

    // Set redirect on initial load or when params change
    useEffect(() => {
        // Simply use the redirect path as is - it should already be in the correct format
        if (redirectPath) {
            setRedirectTo(redirectPath);
            console.log("Redirect path set to:", redirectPath);
        }
    }, [redirectPath]);

    // Redirect if already authenticated
    useEffect(() => {
        // Only proceed if auth state is loaded and user is authenticated
        if (!isLoading && isAuthenticated) {
            if (redirectTo) {
                console.log("Redirecting to:", redirectTo);
                router.push(redirectTo);
            } else {
                router.push('/dashboard');
            }
        }
    }, [isAuthenticated, router, redirectTo, isLoading]);

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col">
            <main className="flex-grow w-full flex flex-col items-center p-4">
                <div className="w-full max-w-md">
                    <AuthForm redirectPath={redirectTo} />
                </div>
            </main>
        </div>
    );
}