import { resendVerificationEmail, SafeActionResult } from "@/app/auth/verify-request/resend.action";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log('Received request to resend verification email');
    const body = await request.json();
    console.log('Request body:', body);

    if (!body.email) {
      console.error('No email provided in request');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('Calling resendVerificationEmail action with:', { email: body.email });
    // Validate email before passing to action
    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        details: { email: body.email }
      }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();
    console.log('Calling resendVerificationEmail with:', { email });
    
    const result = await resendVerificationEmail({ 
      input: { 
        email
      } 
    });
    
    if (result && 'serverError' in result) {
      console.error('Server error:', result.serverError);
      return NextResponse.json({ 
        error: result.serverError 
      }, { status: 500 });
    }
    console.log('Action result:', JSON.stringify(result, null, 2));
    
    if (result && 'error' in result) {
      console.error('Action returned error:', result.error);
      return NextResponse.json({ 
        error: result.error.message,
        details: result.error
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Verification email sent",
      result: result
    });
  } catch (error) {
    console.error('Failed to process request:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to send verification email",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
