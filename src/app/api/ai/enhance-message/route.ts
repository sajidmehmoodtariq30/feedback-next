import { NextResponse } from 'next/server';
import { enhanceMessage } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        message: 'Message is required',
        success: false
      }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({
        message: 'Message is too long (max 1000 characters)',
        success: false
      }, { status: 400 });
    }

    const enhancedMessage = await enhanceMessage(message);

    return NextResponse.json({
      message: 'Message enhanced successfully',
      success: true,
      enhancedMessage
    });

  } catch (error) {
    console.error('Error in enhance-message API:', error);
    return NextResponse.json({
      message: 'Failed to enhance message',
      success: false
    }, { status: 500 });
  }
}
