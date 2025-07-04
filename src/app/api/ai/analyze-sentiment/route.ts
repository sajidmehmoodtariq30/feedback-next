import { NextResponse } from 'next/server';
import { analyzeMessageSentiment } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        message: 'Message is required',
        success: false
      }, { status: 400 });
    }

    const analysis = await analyzeMessageSentiment(message);

    return NextResponse.json({
      message: 'Sentiment analysis completed',
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error in analyze-sentiment API:', error);
    return NextResponse.json({
      message: 'Failed to analyze sentiment',
      success: false
    }, { status: 500 });
  }
}
