'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCodeGenerator from '@/components/QRCodeGenerator';

interface Message {
    _id: string;
    content: string;
    createdAt: string;
}

export default function Dashboard() {
    const { user, loading, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const [isAccepting, setIsAccepting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const messageUrl = `${baseUrl}/send-message/${user?.username}`;

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
        } catch {
            showToastMessage('Failed to refresh messages');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Analytics calculations
    const getMessagesThisWeek = () => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return messages.filter(msg => new Date(msg.createdAt) >= weekAgo).length;
    };

    const getMessagesThisMonth = () => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return messages.filter(msg => new Date(msg.createdAt) >= monthAgo).length;
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-300">Welcome back, {user.username}!</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? (
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={signOut}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Stats Cards */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-300">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{messages.length}</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                    Total Messages
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {messages.length}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-300">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{getMessagesThisWeek()}</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                    This Week
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {getMessagesThisWeek()}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-300">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{getMessagesThisMonth()}</span>
                                            </div>
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                    This Month
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {getMessagesThisMonth()}
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-300">
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
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                    Status
                                                </dt>
                                                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                                                    {isAccepting ? 'Active' : 'Inactive'}
                                                </dd>
                                            </dl>
                                        </div>
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
                                        <button
                                            onClick={() => setShowQRCode(true)}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 16h4.01M16 12h4.01M12 8h4.01M16 8h4.01M8 12h.01M8 16h.01" />
                                            </svg>
                                            QR Code
                                        </button>
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

            {/* QR Code Modal */}
            {showQRCode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share QR Code</h3>
                            <button
                                onClick={() => setShowQRCode(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Scan this QR code to access your feedback link
                            </p>
                            <QRCodeGenerator url={messageUrl} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
