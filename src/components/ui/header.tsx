import { useAuth } from '@/lib/auth';
import { Button } from './button';
import { LogOutIcon } from 'lucide-react';

export function Header() {
  const { currentUser, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-between items-center py-3 px-6 bg-purple-100 border-b border-purple-200">
      <div className="flex items-center">
        <h2 className="text-lg font-medium text-purple-800">
          Welcome, {currentUser?.username}
        </h2>
      </div>
      <Button
        variant="ghost"
        className="text-purple-700 hover:text-purple-900 hover:bg-purple-200"
        onClick={logout}
      >
        <LogOutIcon className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </div>
  );
} 