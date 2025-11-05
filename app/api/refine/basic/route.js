import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';
import OpenAI from 'openai';

// Initialize the OpenAI client for OpenRouter
const openRouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_OPENROUTER_BASE_URL,
});

export async function POST(request) {
  try {
    // Get the session using getServerSession
    const session = await getServerSession(authOptions);

    // Handle 401 (unauthorized) case
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login to use this feature.' },
        { status: 401 }
      );
    }

    // Get prompt from the request body
    const { prompt } = await request.json();

    // Handle 400 (bad request) case if no prompt
    if (!prompt) {
      return NextResponse.json(
        { error: 'Bad request. Prompt is required.' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the user
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    // Check quota
    if (user.basicRefinesRemaining <= 0) {
      return NextResponse.json(
        { error: 'Basic quota exceeded. Please try again tomorrow or upgrade to Pro.' },
        { status: 402 }
      );
    }

    // Create master prompt
    const masterPrompt = `You are an expert prompt engineer. A user will provide a vague prompt. Your ONLY job is to rewrite it into a single, highly-detailed, and actionable prompt for a code-generating AI. Do NOT write a guide. Do NOT answer the prompt. ONLY output the single, improved prompt text. User prompt: "${prompt}"`;

    // AI Call
    const response = await openRouter.chat.completions.create({
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [{ role: 'user', content: masterPrompt }],
    });

    // Get the raw response content
    let refinedContent = response.choices[0].message.content;

    // Clean up special tokens and whitespace
    refinedContent = refinedContent
      .replace(/<s>/g, '')
      .replace(/<\/s>/g, '')
      .replace(/\[INST\]/g, '')
      .replace(/\[\/INST\]/g, '')
      .trim();

    // Update quota
    user.basicRefinesRemaining -= 1;
    await user.save();

    // Return the AI response
    return NextResponse.json(refinedContent);

  } catch (error) {
    console.error('Basic refine error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
