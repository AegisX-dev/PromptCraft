import { NextResponse } from 'next/server';
import connectDB from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get user data from request body
    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Create new user (password will be hashed by pre-save hook)
    const newUser = new User({
      name,
      email,
      password
    });

    // Save user to database
    await newUser.save();

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
