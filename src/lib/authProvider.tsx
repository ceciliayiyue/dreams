'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter} from 'next/navigation';
import {authClient} from "@/lib/auth-client";
// Simple interface for user
export interface User {
    username: string;
    email?: string;
    id?: string;
}

// Authentication context values
interface AuthContextType {
    currentUser: User | null;
    login: (username: string, password: string, redirectPath?: string) => Promise<{ success: boolean; message: string }>;
    signup: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}


// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    login: async () => ({ success: false, message: "Not implemented" }),
    signup: async () => ({ success: false, message: "Not implemented" }),
    logout: () => {},
    isAuthenticated: false,
    isLoading: true
});

// Create the client-side auth instance
const { useSession } = authClient;

// Provider component for authentication
export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();

    // Use better-auth session management
    const { data: session, isPending, error } = useSession();
    if (error) {
        console.error(error)
    }
    // Update currentUser when session changes
    useEffect(() => {
        if (session?.user) {
            setCurrentUser({
                id: session.user.id,
                username: session.user.email,
                email: session.user.email
            });
        } else {
            setCurrentUser(null);
        }
    }, [session]);

    // Check if the user is authenticated
    const isAuthenticated = currentUser !== null;

    // Login function with better-auth
    const login = async (username: string, password: string, redirectPath?: string) => {
        try {
            console.log("Login function called with redirect path:", redirectPath);

            // Determine if username is an email or username
            const isEmail = username.includes('@');

            // Use better-auth signIn.email function
            const { data, error } = await authClient.signIn.email({
                email: isEmail ? username : '',
                password,
            });

            if (data && !error) {
                // After successful login, handle redirect manually with a small delay
                // to ensure authentication state is updated
                setTimeout(() => {
                    if (redirectPath) {
                        console.log("Redirecting to:", redirectPath);
                        router.push(redirectPath);
                    } else {
                        router.push('/dashboard');
                    }
                }, 100);

                return { success: true, message: "Login successful" };
            } else {
                console.error(error)
                return {
                    success: false,
                    message: "Authentication failed"
                };
            }
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "An error occurred during login"
            };
        }
    };
    // Signup function with better-auth
    const signup = async (username: string, password: string) => {
        try {
            // Determine if username is an email or username
            const isEmail = username.includes('@');

            // Use better-auth signUp.email function
            const { data, error } = await authClient.signUp.email({
                email: isEmail ? username : '',
                name: username,
                password,
            });

            if (data && !error) {
                return { success: true, message: "Your account is created" };
            } else {
                console.error("Signup error:", error);
                return {
                    success: false,
                    message: "Sign up failed"
                };
            }
        } catch (error) {
            console.error("Signup error:", error);
            return {
                success: false,
                message: "An error occurred during signup"
            };
        }
    };

    // Logout function with better-auth
    const logout = async () => {
        try {
            // Use better-auth signOut function
            const { error } = await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        // Redirect to login page
                        router.push('/login');
                    }
                }
            });

            if (error) {
                console.error("Logout error:", error);
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                login,
                signup,
                logout,
                isAuthenticated,
                isLoading: isPending
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);