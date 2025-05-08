'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

export function Header() {
    const [isLoading, setIsLoading] = useState(false);

    // Use the authClient's session hook to get authentication state
    const { useSession } = authClient;
    const { data: session } = useSession();

    // Extract the user information from the session
    const user = session?.user;
    const isAuthenticated = !!user;

    // If not authenticated, don't show the header
    if (!isAuthenticated) {
        return null;
    }

    // Handle logout
    const handleLogout = async () => {
        setIsLoading(true);
        try {
            // Use the signOut method directly from authClient
            const { error } = await authClient.signOut();

            if (error) {
                toast.error(error.message || 'Logout failed');
                return;
            }

            // Show success message
            toast.success('Logged out successfully');

            window.location.href = '/login';
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred during logout');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-between items-center py-3 px-6 bg-purple-100 border-b border-purple-200">
            <div className="flex items-center">
                <h2 className="text-lg font-medium text-purple-800">
                    Welcome, {user?.name || user?.email || 'User'}
                </h2>
            </div>
            <Button
                variant="ghost"
                className="text-purple-700 hover:text-purple-900 hover:bg-purple-200"
                onClick={handleLogout}
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                    </>
                ) : (
                    <>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </>
                )}
            </Button>
        </div>
    );
}