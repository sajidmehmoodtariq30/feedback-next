'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyContent() {
    const [code, setCode] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!code.trim()) {
            setMessage('Please enter the verification code');
            return;
        }

        if (code.length !== 6) {
            setMessage('Verification code must be 6 digits');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: email,
                    code: code
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessage('Email verified successfully! Redirecting to dashboard...');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
            } else {
                setMessage(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setMessage('An error occurred during verification');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setMessage('Email address is required to resend code');
            return;
        }

        setIsResending(true);
        setMessage('');

        try {
            // Since we don't have a dedicated resend endpoint, we can use register again
            // This will update the existing user with a new verification code
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    username: 'temp', // This won't be used for existing users
                    password: 'temp123456' // This won't be used for existing users
                }),
            });

            const data = await response.json();
            if (data.success || data.message.includes('already exists')) {
                setMessage('New verification code sent to your email');
            } else {
                setMessage('Failed to resend verification code');
            }
        } catch (error) {
            console.error('Resend error:', error);
            setMessage('Failed to resend verification code');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                    <p className="text-gray-600">
                        We&apos;ve sent a 6-digit verification code to{' '}
                        <span className="font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={code}
                            onChange={(e) => {
                                // Only allow numbers and limit to 6 digits
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setCode(value);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                            placeholder="000000"
                            maxLength={6}
                        />
                        <p className="mt-1 text-xs text-gray-500 text-center">
                            Enter the 6-digit code from your email
                        </p>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${
                            message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || code.length !== 6}
                        className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm mb-2">
                        Didn&apos;t receive the code?
                    </p>
                    <button
                        onClick={handleResendCode}
                        disabled={isResending}
                        className="text-purple-600 hover:text-purple-700 font-medium text-sm disabled:opacity-50"
                    >
                        {isResending ? 'Sending...' : 'Resend Code'}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/sign-in" className="text-gray-500 hover:text-gray-700 text-sm">
                        ← Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Verify() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
