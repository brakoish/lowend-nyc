import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Email validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Simple in-memory store for demo (replace with database in production)
const subscribers = new Set<string>();

// Also handle /api/subscribe for backward compatibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate email
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Check if already subscribed
    if (subscribers.has(email.toLowerCase())) {
      return NextResponse.json(
        { message: 'You are already subscribed!' },
        { status: 200 }
      );
    }
    
    // Add subscriber
    subscribers.add(email.toLowerCase());
    
    // TODO: Integrate with email service (Resend, SendGrid, Mailchimp, etc.)
    // Example with Resend:
    // await resend.contacts.create({
    //   email,
    //   audienceId: process.env.RESEND_AUDIENCE_ID,
    // });
    
    // TODO: Send welcome email
    
    return NextResponse.json(
      { 
        message: 'Successfully subscribed to LOWEND NYC!',
        subscriberCount: subscribers.size
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// Get subscriber count (for admin)
export async function GET(request: NextRequest) {
  // In production, add authentication here
  void request; // Mark as intentionally used for ESLint
  return NextResponse.json({
    subscriberCount: subscribers.size
  });
}
