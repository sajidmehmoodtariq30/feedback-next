'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Message {
    _id: string;
    content: string;
    createdAt: string;
}

export default function Dashboard() {
    const { user, loading, signOut } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');

    useEffect(() => {
        if (user) {
            setIsAccepting(user.isAccepting);
            fetchMessages();
        }
    }, [user]);

    const showToastMessage = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const refreshMessages = async () => {
        setIsRefreshing(true);
        try {
            await fetchMessages();
            showToastMessage('Messages refreshed!');
        } catch (error) {
            showToastMessage('Failed to refresh messages');
        } finally {
            setIsRefreshing(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/get-messages', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const toggleMessageAcceptance = async () => {
        try {
            const response = await fetch('/api/toggle-message-acceptance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    isAccepting: !isAccepting
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setIsAccepting(data.isAccepting);
                }
            }
        } catch (error) {
            console.error('Error toggling message acceptance:', error);
        }
    };

    const deleteMessage = async (messageId: string) => {
        try {
            const response = await fetch(`/api/delete-message?messageId=${messageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(messages.filter(msg => msg._id !== messageId));
                }
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-4">Please sign in to access your dashboard</p>
                    <Link href="/sign-in" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="text-gray-600">Welcome back, {user.username}!</p>
                        </div>
                        <button
                            onClick={signOut}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold">{messages.length}</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Total Messages
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {messages.length}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                isAccepting ? 'bg-green-600' : 'bg-red-600'
                                            }`}>
                                                <span className="text-white text-xs">
                                                    {isAccepting ? '✓' : '✕'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 truncate">
                                                    Status
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900">
                                                    {isAccepting ? 'Accepting' : 'Not Accepting'}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white overflow-hidden shadow rounded-lg">
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center min-w-0 flex-1">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs">@</span>
                                                </div>
                                            </div>
                                            <div className="ml-5 min-w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                                        Your Message Link
                                                    </dt>
                                                    <dd className="text-sm font-medium text-blue-600 truncate">
                                                        <a 
                                                            href={`${baseUrl}/send-message/${user.username}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:text-blue-800"
                                                        >
                                                            {baseUrl}/send-message/{user.username}
                                                        </a>
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const url = `${baseUrl}/send-message/${user.username}`;
                                                try {
                                                    await navigator.clipboard.writeText(url);
                                                    showToastMessage('Link copied to clipboard!');
                                                } catch (err) {
                                                    console.error('Failed to copy link:', err);
                                                    showToastMessage('Failed to copy link');
                                                }
                                            }}
                                            className="ml-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Share Your Link Section */}
                        <div className="lg:col-span-3 bg-gradient-to-r from-purple-600 to-blue-600 shadow rounded-lg p-6 mb-6">
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-white mb-2">Share Your Anonymous Message Link</h3>
                                <p className="text-purple-100 mb-4">
                                    Anyone can send you anonymous messages using this link
                                </p>
                                <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <input
                                            type="text"
                                            value={`${baseUrl}/send-message/${user.username}`}
                                            readOnly
                                            className="w-full text-sm text-gray-700 bg-transparent border-none focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={async () => {
                                                const url = `${baseUrl}/send-message/${user.username}`;
                                                try {
                                                    await navigator.clipboard.writeText(url);
                                                    showToastMessage('Link copied to clipboard!');
                                                } catch (err) {
                                                    console.error('Failed to copy link:', err);
                                                    showToastMessage('Failed to copy link');
                                                }
                                            }}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Copy Link
                                        </button>
                                        <a
                                            href={`${baseUrl}/send-message/${user.username}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            Open Link
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="lg:col-span-3 bg-white shadow rounded-lg p-6 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Message Settings</h3>
                                    <p className="text-sm text-gray-600">
                                        Control whether you want to receive new messages
                                    </p>
                                </div>
                                <button
                                    onClick={toggleMessageAcceptance}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isAccepting
                                            ? 'bg-red-600 text-white hover:bg-red-700'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {isAccepting ? 'Stop Accepting Messages' : 'Start Accepting Messages'}
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="lg:col-span-3">
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
                                    <button
                                        onClick={refreshMessages}
                                        disabled={isRefreshing}
                                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg 
                                            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>
                                <div className="p-6">
                                    {isLoadingMessages ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                            <p className="mt-2 text-gray-600">Loading messages...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">No messages yet</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Share your link with others to start receiving messages!
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((message) => (
                                                <div key={message._id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="text-gray-900">{message.content}</p>
                                                            <p className="text-sm text-gray-500 mt-2">
                                                                {new Date(message.createdAt).toLocaleDateString()} at{' '}
                                                                {new Date(message.createdAt).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => deleteMessage(message._id)}
                                                            className="ml-4 text-red-600 hover:text-red-700 text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {toastMessage}
                    </div>
                </div>
            )}
        </div>
    );
}
