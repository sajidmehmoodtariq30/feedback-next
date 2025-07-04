'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignIn() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();
    const { refreshUser } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.identifier.trim()) {
            newErrors.identifier = 'Email or username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/sign-in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    identifier: formData.identifier.trim(),
                    password: formData.password
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Sign in successful! Redirecting...');
                // Refresh user context to pick up the new authentication state
                await refreshUser();
                
                // Check if user is verified
                if (data.user.isVerified) {
                    router.push('/dashboard');
                } else {
                    router.push(`/verify?email=${encodeURIComponent(data.user.email)}`);
                }
            } else {
                setMessage(data.message || 'Sign in failed');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            setMessage('An error occurred during sign in');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="card p-8 w-full max-w-md hover-lift animate-fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-foreground mb-2">
                            Email or Username
                        </label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-input border-2 border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${
                                errors.identifier ? 'border-destructive focus:border-destructive' : ''
                            }`}
                            placeholder="Enter your email or username"
                        />
                        {errors.identifier && (
                            <p className="mt-2 text-sm text-destructive animate-fade-in">{errors.identifier}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-input border-2 border-border rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 ${
                                errors.password ? 'border-destructive focus:border-destructive' : ''
                            }`}
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="mt-2 text-sm text-destructive animate-fade-in">{errors.password}</p>
                        )}
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl text-sm animate-fade-in ${
                            message.includes('successful') ? 'bg-success/10 text-success border border-success/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/sign-up" className="text-primary hover:text-primary/80 font-medium transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
