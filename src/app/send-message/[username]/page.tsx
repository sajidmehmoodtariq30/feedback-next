'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AIMessageAssistant from '@/components/AIMessageAssistant';

export default function SendMessage() {
    const params = useParams();
    const username = params.username as string;
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [messageLength, setMessageLength] = useState(0);

    const MAX_LENGTH = 300;

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= MAX_LENGTH) {
            setMessage(value);
            setMessageLength(value.length);
        }
    };

    const handleAIMessageUpdate = (newMessage: string) => {
        if (newMessage.length <= MAX_LENGTH) {
            setMessage(newMessage);
            setMessageLength(newMessage.length);
        } else {
            // Truncate if too long
            const truncated = newMessage.substring(0, MAX_LENGTH);
            setMessage(truncated);
            setMessageLength(MAX_LENGTH);
            setFeedback('Message was truncated to fit the character limit');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!message.trim()) {
            setFeedback('Please enter a message');
            return;
        }

        if (message.trim().length < 10) {
            setFeedback('Message must be at least 10 characters long');
            return;
        }

        setIsLoading(true);
        setFeedback('');

        try {
            const response = await fetch('/api/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    content: message.trim()
                }),
            });

            const data = await response.json();

            if (data.success) {
                setFeedback('Message sent successfully!');
                setMessage('');
                setMessageLength(0);
            } else {
                setFeedback(data.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Send message error:', error);
            setFeedback('An error occurred while sending the message');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Send Anonymous Message
                            </h1>
                            <p className="text-gray-600">
                                Send a message to <span className="font-medium text-purple-600">@{username}</span>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    value={message}
                                    onChange={handleMessageChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Type your anonymous message here..."
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-500">
                                        Minimum 10 characters required
                                    </p>
                                    <p className={`text-xs ${
                                        messageLength > MAX_LENGTH * 0.9 ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                        {messageLength}/{MAX_LENGTH}
                                    </p>
                                </div>

                                {/* AI Assistant */}
                                <AIMessageAssistant
                                    message={message}
                                    onMessageUpdate={handleAIMessageUpdate}
                                    disabled={isLoading}
                                />
                            </div>

                            {feedback && (
                                <div className={`p-3 rounded-lg text-sm ${
                                    feedback.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {feedback}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading || message.trim().length < 10}
                                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isLoading ? 'Sending...' : 'Send Anonymous Message'}
                            </button>
                        </form>

                        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">Privacy & AI Notice</h3>
                            <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Your message will be sent anonymously</li>
                                <li>• We do not store any identifying information about you</li>
                                <li>• AI assistance is optional and helps improve message clarity</li>
                                <li>• Please be respectful and constructive in your feedback</li>
                                <li>• Harmful or inappropriate messages may be reported</li>
                            </ul>
                        </div>

                        <div className="mt-6 text-center">
                            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
                                ← Back to home
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-white text-sm">
                            Want to receive anonymous messages too?{' '}
                            <Link href="/sign-up" className="underline hover:no-underline">
                                Create your account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
