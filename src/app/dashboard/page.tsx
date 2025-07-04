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
                    setIsAccepting(!isAccepting);
                    showToastMessage(`Message acceptance ${!isAccepting ? 'enabled' : 'disabled'}`);
                }
            }
        } catch (error) {
            console.error('Error toggling message acceptance:', error);
            showToastMessage('Failed to update settings');
        }
    };

    const deleteMessage = async (messageId: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await fetch('/api/delete-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ messageId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMessages(messages.filter(msg => msg._id !== messageId));
                    showToastMessage('Message deleted successfully');
                }
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showToastMessage('Failed to delete message');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
                    <p className="text-muted-foreground mb-6">Please sign in to access your dashboard</p>
                    <Link href="/sign-in" className="btn-primary px-6 py-3 rounded-lg">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-all duration-300">
            {/* Header */}
            <header className="bg-card shadow-lg border-b border-border transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                            <p className="text-muted-foreground">Welcome back, {user.username}!</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-xl bg-secondary hover:bg-accent transition-all duration-300 hover-lift"
                                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? (
                                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </button>
                            <button
                                onClick={signOut}
                                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-xl hover:bg-destructive/90 transition-all duration-300 hover-lift"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Cards */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="card p-6 hover-lift animate-fade-in">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                            <span className="text-primary-foreground font-bold text-lg">{messages.length}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                                        <p className="text-2xl font-bold text-foreground">{messages.length}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6 hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">{getMessagesThisWeek()}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-foreground">This Week</p>
                                        <p className="text-2xl font-bold text-foreground">{getMessagesThisWeek()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">{getMessagesThisMonth()}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-foreground">This Month</p>
                                        <p className="text-2xl font-bold text-foreground">{getMessagesThisMonth()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6 hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            isAccepting ? 'bg-success' : 'bg-muted'
                                        }`}>
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAccepting ? 
                                                    "M5 13l4 4L19 7" : 
                                                    "M6 18L18 6M6 6l12 12"
                                                } />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {isAccepting ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 hover-lift animate-slide-in">
                                <h3 className="text-lg font-semibold text-foreground mb-6">Settings</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-foreground">Accept Messages</span>
                                            <button
                                                onClick={toggleMessageAcceptance}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                    isAccepting ? 'bg-primary' : 'bg-muted'
                                                }`}
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                                                        isAccepting ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </label>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {isAccepting ? 'You are currently accepting messages' : 'You are not accepting messages'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Your Message URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                readOnly
                                                value={messageUrl}
                                                className="flex-1 px-3 py-2 text-sm bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button
                                                onClick={() => navigator.clipboard.writeText(messageUrl)}
                                                className="btn-secondary px-3 py-2 text-sm rounded-lg"
                                                title="Copy URL"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => setShowQRCode(!showQRCode)}
                                            className="btn-secondary w-full py-2 text-sm rounded-lg"
                                        >
                                            {showQRCode ? 'Hide QR Code' : 'Show QR Code'}
                                        </button>
                                        {showQRCode && (
                                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                                <QRCodeGenerator url={messageUrl} size={150} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Panel */}
                        <div className="lg:col-span-2">
                            <div className="card p-6 hover-lift animate-slide-in" style={{ animationDelay: '0.2s' }}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-foreground">Recent Messages</h3>
                                    <button
                                        onClick={refreshMessages}
                                        disabled={isRefreshing}
                                        className="btn-secondary px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                                    >
                                        {isRefreshing ? (
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        )}
                                        Refresh
                                    </button>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {isLoadingMessages ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                            <p className="text-muted-foreground">Loading messages...</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <h4 className="text-lg font-medium text-foreground mb-2">No messages yet</h4>
                                            <p className="text-muted-foreground mb-4">Share your message URL to start receiving anonymous feedback</p>
                                            <Link href={messageUrl} className="btn-primary px-4 py-2 rounded-lg">
                                                View Your Message Page
                                            </Link>
                                        </div>
                                    ) : (
                                        messages.map((message, index) => (
                                            <div key={message._id} className="bg-muted p-4 rounded-lg hover:bg-accent transition-colors animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-foreground mb-2">{message.content}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(message.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => deleteMessage(message._id)}
                                                        className="text-destructive hover:text-destructive/80 ml-2 p-1 rounded transition-colors"
                                                        title="Delete message"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
                    <div className="toast p-4 rounded-lg shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow"></div>
                            <p className="text-sm font-medium">{toastMessage}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
