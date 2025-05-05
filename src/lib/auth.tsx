import { createContext, useContext, useState, ReactNode } from 'react';

// Simple interface for user
export interface User {
  username: string;
}

// In-memory user storage
interface UserStorage {
  [username: string]: {
    password: string;
  };
}

// Authentication context values
interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  login: async () => ({ success: false, message: "Not implemented" }),
  signup: async () => ({ success: false, message: "Not implemented" }),
  logout: () => {},
  isAuthenticated: false,
});

// In-memory user storage
const users: UserStorage = {};

// Provider component for authentication
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check if the user is authenticated
  const isAuthenticated = currentUser !== null;

  // Login function
  const login = async (username: string, password: string) => {
    // Check if username exists and password matches
    if (!users[username]) {
      return { success: false, message: "User not found. Please sign up instead." };
    }

    if (users[username].password !== password) {
      return { success: false, message: "Incorrect username or password" };
    }

    // Set the current user
    setCurrentUser({ username });
    return { success: true, message: "Login successful" };
  };

  // Signup function
  const signup = async (username: string, password: string) => {
    // Check if username already exists
    if (users[username]) {
      return { success: false, message: "Username already taken" };
    }

    // Create new user
    users[username] = { password };
    return { success: true, message: "Your account is created" };
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext); 