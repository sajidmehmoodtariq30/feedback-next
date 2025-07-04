'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
    id: string;
    username: string;
    email: string;
    isVerified: boolean;
    isAccepting: boolean;
    messageCount?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            console.log('AuthContext: Fetching user data...');
            // Add a small delay to ensure cookies are set
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const response = await fetch('/api/user', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store' // Ensure fresh request
            });
            console.log('AuthContext: Response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('AuthContext: Response data:', data);
                if (data.success) {
                    console.log('AuthContext: Setting user:', data.user);
                    setUser(data.user);
                } else {
                    console.log('AuthContext: API returned success: false');
                    setUser(null);
                }
            } else {
                console.log('AuthContext: Response not ok, status:', response.status);
                const errorData = await response.json().catch(() => null);
                console.log('AuthContext: Error response:', errorData);
                setUser(null);
            }
        } catch (error) {
            console.error('AuthContext: Error fetching user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await fetch('/api/sign-out', { 
                method: 'POST',
                credentials: 'include'
            });
            setUser(null);
            window.location.href = '/sign-in';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const refreshUser = async () => {
        await fetchUser();
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
