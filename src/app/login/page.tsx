// In login page.tsx
'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/auth/AuthForm';
import { authClient } from '@/lib/auth-client';

export default function LoginPage() {
    const router = useRouter();
    const { useSession } = authClient;
    const { data: session, isPending } = useSession();

    // Middleware should handle this, but as a backup we also check client-side
    useEffect(() => {
        if (!isPending && session?.user) {
            router.replace('/dashboard');
        }
    }, [session, isPending, router]);

    // If still loading auth state, show loading indicator
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100">
                <div className="flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-purple-800">Checking authentication...</p>
                </div>
            </div>
        );
    }



    // Show login form for non-authenticated users
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-purple-100">
            <div className="w-full max-w-md p-8">
                <AuthForm />
            </div>
        </div>
    );
}