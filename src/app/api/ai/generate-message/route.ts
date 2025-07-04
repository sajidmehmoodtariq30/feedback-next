import { NextResponse } from 'next/server';
import { generateMessage } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({
        message: 'Prompt is required',
        success: false
      }, { status: 400 });
    }

    if (prompt.length > 500) {
      return NextResponse.json({
        message: 'Prompt is too long (max 500 characters)',
        success: false
      }, { status: 400 });
    }

    const generatedMessage = await generateMessage(prompt);

    return NextResponse.json({
      message: 'Message generated successfully',
      success: true,
      generatedMessage
    });

  } catch (error) {
    console.error('Error in generate-message API:', error);
    return NextResponse.json({
      message: 'Failed to generate message',
      success: false
    }, { status: 500 });
  }
}
