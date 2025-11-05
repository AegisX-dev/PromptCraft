import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    if (user.proRefinesRemaining <= 0) {
      return NextResponse.json(
        { error: 'Pro quota exceeded. Please try again tomorrow.' },
        { status: 402 }
      );
    }

    // AI Call
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Master prompt for the Pro refine (Project Decomposer)
    const masterPrompt = `You are "Catalyst," an expert strategic co-founder (CPO/CTO/CMO). I am "Dev," your AI-Assisted Technical Founder.
My Vague Idea: "${prompt}"
Your task is to take my vague idea and generate a single, structured, "meta-prompt" for me to give to a code-generating AI (like VS Code Copilot).
This meta-prompt MUST be formatted in markdown and include these exact sections:
## CORE_MISSION
(e.g., "To build a v1 MERN-stack Twitter clone.")
## TECH_STACK
(e.g., "Framework: NEXT.js (App Router), Database: MongoDB (with Mongoose), Auth: next-auth, Styling: Tailwind CSS")
## CORE_DATABASE_SCHEMAS
(Describe the Mongoose schemas for the main models as a list of fields and their types. e.g., "User: name (String), email (String, unique), password (String), createdAt (Date)" - DO NOT provide code blocks, only written descriptions)
## CORE_FEATURES_TO_BUILD
(A list of the 3-5 most critical v1 features. e.g., "1. User Auth API, 2. Create Tweet API, 3. Timeline Feed")
## YOUR_FIRST_TASK
(A single, actionable first step for the coding AI. e.g., "Your first task is to create the Mongoose model files for the schemas described in the CORE_DATABASE_SCHEMAS section.")
IMPORTANT: Generate ONLY markdown text with bullet points and descriptions. Do NOT include any code blocks, code snippets, or code examples. Write everything as clear, descriptive text.
`;

    const result = await model.generateContent(masterPrompt);
    const response = result.response.text();

    // Update quota
    user.proRefinesRemaining -= 1;
    await user.save();

    // Return the AI response
    return NextResponse.json(response);

  } catch (error) {
    console.error('Pro refine error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
