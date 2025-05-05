import { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { AuthForm } from './AuthForm';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated } = useAuth();

  // If the user is not authenticated, show the auth form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-purple-50 to-purple-100 flex flex-col">
        <main className="flex-grow w-full flex flex-col items-center p-4">
          <div className="w-full max-w-md">
            <AuthForm />
          </div>
        </main>
      </div>
    );
  }

  // Otherwise, show the children (protected content)
  return <div className="w-full">{children}</div>;
} 