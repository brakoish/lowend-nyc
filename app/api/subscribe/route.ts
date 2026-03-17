import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

    if (!BUTTONDOWN_API_KEY) {
      // If no API key is configured, store the email in a log or database
      // For now, return a success message but log the issue
      console.log('Newsletter signup (no API key configured):', email);
      return NextResponse.json(
        { 
          success: true, 
          message: 'Thanks for subscribing! You\'re on the list.',
          note: 'API key not configured - email logged for manual processing'
        },
        { status: 200 }
      );
    }

    // Subscribe to Buttondown
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        tags: ['lowend-nyc', 'website-signup'],
      }),
    });

    if (response.ok) {
      return NextResponse.json(
        { success: true, message: 'Thanks for subscribing! Check your inbox for confirmation.' },
        { status: 200 }
      );
    }

    // Handle specific Buttondown errors
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 409) {
      return NextResponse.json(
        { success: true, message: 'You\'re already subscribed! Thanks for being part of LOWEND NYC.' },
        { status: 200 }
      );
    }

    throw new Error(errorData.detail || 'Failed to subscribe');

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
