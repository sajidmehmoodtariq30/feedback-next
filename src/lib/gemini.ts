import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function enhanceMessage(originalMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Please enhance the following feedback message to make it more constructive, clear, and professional while maintaining the original intent and sentiment. Keep it concise and respectful. The enhanced message should be between 100-300 characters:

Original message: "${originalMessage}"

Enhanced message:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text();

    return enhancedText.trim();
  } catch (error) {
    console.error('Error enhancing message with AI:', error);
    throw new Error('Failed to enhance message');
  }
}

export async function generateMessage(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = `Generate a constructive and professional feedback message based on the following description or topic. Make it specific, actionable, and respectful. The message should be between 100-300 characters:

Topic/Description: "${prompt}"

Feedback message:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const generatedText = response.text();

    return generatedText.trim();
  } catch (error) {
    console.error('Error generating message with AI:', error);
    throw new Error('Failed to generate message');
  }
}

export async function analyzeMessageSentiment(message: string): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  summary: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze the sentiment of this feedback message and provide a JSON response with the following format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": number between 0 and 1,
  "summary": "brief summary of the message tone and key points"
}

Message to analyze: "${message}"

Response:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(analysisText);
      return parsed;
    } catch {
      // Fallback if JSON parsing fails
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        summary: 'Unable to analyze sentiment'
      };
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw new Error('Failed to analyze message sentiment');
  }
}
