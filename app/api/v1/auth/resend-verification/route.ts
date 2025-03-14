import { resendVerificationEmail } from "@/lib/auth/resend-verification";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    logger.info('Received request to resend verification email');
    const body = await request.json();
    logger.info('Request body', { body });

    if (!body.email) {
      logger.error('No email provided in request');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    logger.info('Calling resendVerificationEmail action', { email: body.email });
    // Validate email before passing to action
    if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        details: { email: body.email }
      }, { status: 400 });
    }

    const email = body.email.toLowerCase().trim();
    logger.info('Calling resendVerificationEmail', { email });
    
    const result = await resendVerificationEmail({ 
      input: { 
        email
      } 
    });
    
    if (!result.success && result.serverError) {
      logger.error('Server error', { error: result.serverError });
      return NextResponse.json({ 
        error: result.serverError 
      }, { status: 500 });
    }
    logger.info('Action result', { result });
    
    if (result.error) {
      logger.error('Action returned error', { error: result.error });
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
    logger.error('Failed to process request', {
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
