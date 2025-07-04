'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuth() {
    const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
    const { user, loading, refreshUser } = useAuth();

    const testCookies = async () => {
        try {
            const response = await fetch('/api/test-cookies', {
                credentials: 'include'
            });
            const data = await response.json();
            setTestResult(data);
        } catch (error) {
            setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    const testUser = async () => {
        try {
            const response = await fetch('/api/user', {
                credentials: 'include'
            });
            const data = await response.json();
            setTestResult(data);
        } catch (error) {
            setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Authentication Test</h1>
                
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
                    <div className="space-y-2">
                        <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
                        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
                    <div className="space-x-4">
                        <button
                            onClick={testCookies}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Test Cookies
                        </button>
                        <button
                            onClick={testUser}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Test User API
                        </button>
                        <button
                            onClick={refreshUser}
                            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        >
                            Refresh User
                        </button>
                    </div>
                </div>

                {testResult && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Test Result</h2>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                            {JSON.stringify(testResult, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
