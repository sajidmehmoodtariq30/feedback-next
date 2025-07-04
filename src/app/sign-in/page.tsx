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
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                            Email or Username
                        </label>
                        <input
                            type="text"
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.identifier ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your email or username"
                        />
                        {errors.identifier && (
                            <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                                errors.password ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your password"
                        />
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${
                            message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don&apos;t have an account?{' '}
                        <Link href="/sign-up" className="text-purple-600 hover:text-purple-700 font-medium">
                            Create one
                        </Link>
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    );
}
