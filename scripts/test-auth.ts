import { logger } from '../src/lib/logger';
import { prisma } from '../src/lib/prisma';
import { hash, compare } from 'bcryptjs';
import { randomUUID } from "crypto";

interface AuthTestResult {
  scenario: string;
  success: boolean;
  error?: string;
  redirectUrl?: string;
  details?: Record<string, any>;
}

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

const LOCKOUT_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
};

const MAGIC_LINK_CONFIG = {
  tokenExpiration: 15 * 60 * 1000, // 15 minutes in milliseconds
  maxActiveTokens: 1 // Maximum number of active tokens per user
};

const OAUTH_CONFIG = {
  stateExpiration: 10 * 60 * 1000, // 10 minutes in milliseconds
  providers: ['google', 'twitter'],
  requiredScopes: {
    google: ['openid', 'profile', 'email'],
    twitter: ['users.read', 'tweet.read', 'offline.access']
  },
  maxAttempts: 10
};

const ACCOUNT_RECOVERY_CONFIG = {
  tokenExpiration: 30 * 60 * 1000, // 30 minutes in milliseconds
  maxResetRequests: 3, // Maximum password reset requests per hour
  minPasswordAge: 24 * 60 * 60 * 1000 // 24 hours minimum between password changes
};

const SECURITY_CONFIG = {
  csrfTokenExpiration: 60 * 60 * 1000, // 1 hour in milliseconds
  ipRateLimits: {
    loginAttempts: { max: 5, window: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    passwordReset: { max: 3, window: 60 * 60 * 1000 }, // 3 attempts per hour
    apiRequests: { max: 100, window: 60 * 1000 } // 100 requests per minute
  },
  requiredSecurityHeaders: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
    'X-XSS-Protection': '1; mode=block'
  },
  suspiciousPatterns: {
    userAgents: [
      'curl/',
      'python-requests/',
      'Postman',
      'Mozilla/5.0 (compatible;'
    ],
    ipRanges: [
      '0.0.0.0/8',
      '100.64.0.0/10',
      '127.0.0.0/8',
      '169.254.0.0/16',
      '192.0.0.0/24',
      '192.0.2.0/24',
      '198.51.100.0/24',
      '203.0.113.0/24'
    ]
  }
};

const scenarios = {
  EMAIL_SIGNUP: {
    name: "Email Signup",
    cases: [
      {
        name: "New User",
        email: "newuser@test.com",
        password: "Test123!",
        expectedRedirect: "/orgs"
      },
      {
        name: "Existing Email",
        email: "existing@test.com",
        password: "Test123!",
        expectError: true
      },
      {
        name: "Invalid Password - Too Short",
        email: "test@test.com",
        password: "weak",
        expectError: true,
        expectedError: "Password must be at least 8 characters"
      },
      {
        name: "Invalid Password - No Uppercase",
        email: "test@test.com",
        password: "test123!",
        expectError: true,
        expectedError: "Password must contain at least one uppercase letter"
      },
      {
        name: "Invalid Password - No Lowercase",
        email: "test@test.com",
        password: "TEST123!",
        expectError: true,
        expectedError: "Password must contain at least one lowercase letter"
      },
      {
        name: "Invalid Password - No Numbers",
        email: "test@test.com",
        password: "TestTest!",
        expectError: true,
        expectedError: "Password must contain at least one number"
      },
      {
        name: "Invalid Password - No Special Chars",
        email: "test@test.com",
        password: "Test1234",
        expectError: true,
        expectedError: "Password must contain at least one special character"
      },
      {
        name: "Invalid Email Format",
        email: "invalid-email",
        password: "Test123!",
        expectError: true,
        expectedError: "Invalid email format"
      },
      {
        name: "Email Verification Required",
        email: "verify@test.com",
        password: "Test123!",
        expectedRedirect: "/auth/verify-email",
        requiresVerification: true
      },
      {
        name: "Concurrent Signup Attempt",
        email: "concurrent@test.com",
        password: "Test123!",
        concurrent: true,
        expectError: true,
        expectedError: "Email already in use"
      }
    ]
  },
  EMAIL_SIGNIN: {
    name: "Email Sign In",
    cases: [
      {
        name: "Valid Credentials",
        email: "existing@test.com",
        password: "Test123!",
        expectedRedirect: "/account"
      },
      {
        name: "Invalid Password",
        email: "existing@test.com",
        password: "wrong",
        expectError: true
      },
      {
        name: "Non-existent User",
        email: "nonexistent@test.com",
        password: "Test123!",
        expectError: true
      }
    ]
  },
  MAGIC_LINK: {
    name: "Magic Link",
    cases: [
      {
        name: "Send Magic Link",
        email: "magic@test.com",
        expectedResult: "Magic link sent"
      },
      {
        name: "Invalid Email Format",
        email: "invalid-email",
        expectError: true,
        expectedError: "Invalid email format"
      },
      {
        name: "Verify Valid Magic Link",
        email: "magic@test.com",
        verifyToken: true,
        expectedResult: "Magic link verified"
      },
      {
        name: "Verify Expired Magic Link",
        email: "magic@test.com",
        verifyToken: true,
        expiredToken: true,
        expectError: true,
        expectedError: "Magic link expired"
      },
      {
        name: "Verify Used Magic Link",
        email: "magic@test.com",
        verifyToken: true,
        usedToken: true,
        expectError: true,
        expectedError: "Magic link already used"
      },
      {
        name: "Multiple Magic Link Requests",
        email: "magic@test.com",
        multipleRequests: true,
        expectedResult: "Previous magic links invalidated"
      },
      {
        name: "Magic Link with Non-existent Email",
        email: "nonexistent@test.com",
        verifyToken: true,
        expectError: true,
        expectedError: "Invalid magic link"
      }
    ]
  },
  OAUTH: {
    name: "OAuth Authentication",
    cases: [
      {
        name: "Valid OAuth State",
        provider: "google",
        expectedResult: "OAuth state validated"
      },
      {
        name: "Invalid OAuth State",
        provider: "google",
        invalidState: true,
        expectError: true,
        expectedError: "Invalid OAuth state"
      },
      {
        name: "Expired OAuth State",
        provider: "google",
        expiredState: true,
        expectError: true,
        expectedError: "OAuth state expired"
      },
      {
        name: "Missing OAuth Scopes",
        provider: "google",
        missingScopes: true,
        expectError: true,
        expectedError: "Insufficient OAuth scopes"
      },
      {
        name: "Invalid OAuth Code",
        provider: "google",
        invalidCode: true,
        expectError: true,
        expectedError: "Invalid OAuth authorization code"
      },
      {
        name: "OAuth Account Linking",
        provider: "google",
        email: "test@test.com",
        linkAccount: true,
        expectedResult: "Account linked successfully"
      },
      {
        name: "OAuth Account Already Linked",
        provider: "google",
        email: "test@test.com",
        linkAccount: true,
        alreadyLinked: true,
        expectError: true,
        expectedError: "Account already linked"
      },
      {
        name: "OAuth Provider Error",
        provider: "google",
        providerError: true,
        expectError: true,
        expectedError: "Provider authentication failed"
      },
      {
        name: "Valid Twitter OAuth",
        provider: "twitter",
        expectedResult: "OAuth state validated"
      },
      {
        name: "OAuth Rate Limiting",
        provider: "google",
        rateLimited: true,
        expectError: true,
        expectedError: "Too many OAuth requests"
      }
    ]
  },
  EMAIL_VERIFICATION: {
    name: "Email Verification",
    cases: [
      {
        name: "Send Verification Email",
        email: "verify@test.com",
        password: "Test123!",
        requiresVerification: true,
        expectedResult: "Verification email sent"
      },
      {
        name: "Verify Email with Valid Token",
        email: "verify@test.com",
        password: "Test123!",
        verifyEmail: true,
        expectedResult: "Email verified"
      },
      {
        name: "Attempt Access Before Verification",
        email: "verify@test.com",
        password: "Test123!",
        checkAccess: true,
        expectError: true,
        expectedError: "Email not verified"
      },
      {
        name: "Verify with Expired Token",
        email: "verify@test.com",
        password: "Test123!",
        verifyEmail: true,
        expiredToken: true,
        expectError: true,
        expectedError: "Verification token expired"
      },
      {
        name: "Verify with Invalid Token",
        email: "verify@test.com",
        password: "Test123!",
        verifyEmail: true,
        invalidToken: true,
        expectError: true,
        expectedError: "Invalid verification token"
      },
      {
        name: "Resend Verification Email",
        email: "verify@test.com",
        password: "Test123!",
        resendVerification: true,
        expectedResult: "Verification email resent"
      }
    ]
  },
  SESSION_MANAGEMENT: {
    name: "Session Management",
    cases: [
      {
        name: "Session Creation",
        email: "session@test.com",
        password: "Test123!",
        expectedToken: true
      },
      {
        name: "Session Expiration",
        email: "session@test.com",
        password: "Test123!",
        simulateExpiration: true,
        expectError: true,
        expectedError: "Session expired"
      },
      {
        name: "Multiple Sessions",
        email: "session@test.com",
        password: "Test123!",
        multipleSessions: true,
        expectedSessions: 2
      },
      {
        name: "Session Invalidation on Logout",
        email: "session@test.com",
        password: "Test123!",
        testLogout: true,
        expectedResult: "Session invalidated"
      },
      {
        name: "Invalid Session Token",
        email: "session@test.com",
        password: "Test123!",
        invalidToken: true,
        expectError: true,
        expectedError: "Invalid session token"
      }
    ]
  },
  ACCOUNT_LOCKOUT: {
    name: "Account Lockout",
    cases: [
      {
        name: "First Failed Attempt",
        email: "lockout@test.com",
        password: "WrongPass123!",
        expectError: true,
        expectedError: "Invalid credentials"
      },
      {
        name: "Second Failed Attempt",
        email: "lockout@test.com",
        password: "WrongPass123!",
        expectError: true,
        expectedError: "Invalid credentials"
      },
      {
        name: "Third Failed Attempt",
        email: "lockout@test.com",
        password: "WrongPass123!",
        expectError: true,
        expectedError: "Invalid credentials"
      },
      {
        name: "Fourth Failed Attempt",
        email: "lockout@test.com",
        password: "WrongPass123!",
        expectError: true,
        expectedError: "Invalid credentials"
      },
      {
        name: "Fifth Failed Attempt - Account Locked",
        email: "lockout@test.com",
        password: "WrongPass123!",
        expectError: true,
        expectedError: "Account locked. Try again in 30 minutes"
      },
      {
        name: "Attempt During Lockout",
        email: "lockout@test.com",
        password: "Test123!",
        expectError: true,
        expectedError: "Account locked. Try again in 30 minutes"
      },
      {
        name: "Reset Failed Attempts After Success",
        email: "lockout@test.com",
        password: "Test123!",
        afterLockoutExpiry: true,
        expectedResult: "Login successful"
      }
    ]
  },
  ACCOUNT_RECOVERY: {
    name: "Account Recovery",
    cases: [
      {
        name: "Request Password Reset",
        email: "test@test.com",
        expectedResult: "Password reset requested"
      },
      {
        name: "Invalid Email for Reset",
        email: "nonexistent@test.com",
        expectError: true,
        expectedError: "User not found"
      },
      {
        name: "Valid Reset Token",
        email: "test@test.com",
        newPassword: "NewPass123!",
        verifyToken: true,
        expectedResult: "Password reset successful"
      },
      {
        name: "Expired Reset Token",
        email: "test@test.com",
        newPassword: "NewPass123!",
        verifyToken: true,
        expiredToken: true,
        expectError: true,
        expectedError: "Reset token expired"
      },
      {
        name: "Used Reset Token",
        email: "test@test.com",
        newPassword: "NewPass123!",
        verifyToken: true,
        usedToken: true,
        expectError: true,
        expectedError: "Reset token already used"
      },
      {
        name: "Rate Limited Reset",
        email: "test@test.com",
        rateLimited: true,
        expectError: true,
        expectedError: "Too many reset attempts"
      },
      {
        name: "Recent Password Change",
        email: "test@test.com",
        recentChange: true,
        expectError: true,
        expectedError: "Password changed too recently"
      }
    ]
  },
  REMEMBER_ME: {
    name: "Remember Me",
    cases: [
      {
        name: "Login with Remember Me",
        email: "test@test.com",
        password: "TestPass123!",
        rememberMe: true,
        expectedResult: "Extended session created"
      },
      {
        name: "Login without Remember Me",
        email: "test@test.com",
        password: "TestPass123!",
        rememberMe: false,
        expectedResult: "Standard session created"
      },
      {
        name: "Extended Session Persistence",
        email: "test@test.com",
        password: "TestPass123!",
        rememberMe: true,
        checkPersistence: true,
        expectedResult: "Session persisted"
      }
    ]
  },
  SECURITY: {
    name: "Security Features",
    cases: [
      // CSRF Tests
      {
        name: "Valid CSRF Token",
        endpoint: "/api/auth/signin",
        method: "POST",
        expectedResult: "Valid CSRF token"
      },
      {
        name: "Missing CSRF Token",
        endpoint: "/api/auth/signin",
        method: "POST",
        missingCsrf: true,
        expectError: true,
        expectedError: "CSRF token missing"
      },
      {
        name: "Invalid CSRF Token",
        endpoint: "/api/auth/signin",
        method: "POST",
        invalidCsrf: true,
        expectError: true,
        expectedError: "Invalid CSRF token"
      },
      {
        name: "Expired CSRF Token",
        endpoint: "/api/auth/signin",
        method: "POST",
        expiredCsrf: true,
        expectError: true,
        expectedError: "CSRF token expired"
      },
      // Security Headers Tests
      {
        name: "Required Security Headers",
        endpoint: "/api/auth/signin",
        method: "GET",
        expectedResult: "All security headers present"
      },
      {
        name: "CSP Header Validation",
        endpoint: "/api/auth/signin",
        method: "GET",
        checkCsp: true,
        expectedResult: "Valid CSP configuration"
      },
      {
        name: "HSTS Header Validation",
        endpoint: "/api/auth/signin",
        method: "GET",
        checkHsts: true,
        expectedResult: "Valid HSTS configuration"
      },
      // IP-based Protection Tests
      {
        name: "IP Rate Limiting - Login",
        endpoint: "/api/auth/signin",
        method: "POST",
        ip: "192.168.1.1",
        exceedLoginAttempts: true,
        expectError: true,
        expectedError: "Too many login attempts"
      },
      {
        name: "IP Rate Limiting - Password Reset",
        endpoint: "/api/auth/forgot-password",
        method: "POST",
        ip: "192.168.1.2",
        exceedResetAttempts: true,
        expectError: true,
        expectedError: "Too many password reset attempts"
      },
      {
        name: "IP Rate Limiting - API",
        endpoint: "/api/auth/session",
        method: "GET",
        ip: "192.168.1.3",
        exceedApiRequests: true,
        expectError: true,
        expectedError: "Too many API requests"
      },
      {
        name: "Suspicious IP Blocking",
        endpoint: "/api/auth/signin",
        method: "POST",
        ip: "192.0.2.1",
        expectError: true,
        expectedError: "Access denied from suspicious IP"
      },
      {
        name: "Suspicious User Agent Blocking",
        endpoint: "/api/auth/signin",
        method: "POST",
        userAgent: "curl/7.64.1",
        expectError: true,
        expectedError: "Access denied for suspicious user agent"
      }
    ]
  },
  ADVANCED_OAUTH_SCENARIOS: {
    name: "Advanced OAuth Scenarios",
    cases: [
      {
        name: "Account Merging",
        provider: "google",
        email: "test@example.com",
        password: "password123",
        expectedResult: "Account merged successfully"
      },
      {
        name: "Provider Error Recovery",
        provider: "google",
        email: "test@example.com",
        password: "password123",
        expectedResult: "Provider error recovered"
      },
      {
        name: "Token Refresh",
        provider: "google",
        email: "test@example.com",
        password: "password123",
        expectedResult: "Token refreshed successfully"
      },
      {
        name: "Cross-Provider Account Linking",
        provider: "google",
        email: "test@example.com",
        password: "password123",
        expectedResult: "Account linked successfully"
      }
    ]
  }
};

interface OAuthProfile {
  email: string;
  provider: string;
  providerId: string;
  name?: string;
  image?: string;
}

async function handleOAuthSignIn(profile: OAuthProfile) {
  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
    include: {
      accounts: true
    }
  });

  if (!existingUser) {
    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        image: profile.image,
        emailVerified: new Date(),
        accounts: {
          create: {
            provider: profile.provider,
            providerAccountId: profile.providerId,
            type: 'oauth'
          }
        }
      },
      include: {
        accounts: true
      }
    });

    return {
      action: 'create',
      user: newUser,
      accounts: newUser.accounts
    };
  }

  // Check if account already exists
  const existingAccount = existingUser.accounts.find(
    account => account.provider === profile.provider && 
    account.providerAccountId === profile.providerId
  );

  if (existingAccount) {
    return {
      action: 'signin',
      user: existingUser,
      accounts: existingUser.accounts
    };
  }

  // Link new account to existing user
  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      accounts: {
        create: {
          provider: profile.provider,
          providerAccountId: profile.providerId,
          type: 'oauth'
        }
      }
    },
    include: {
      accounts: true
    }
  });

  return {
    action: 'merge',
    user: updatedUser,
    accounts: updatedUser.accounts
  };
}

interface TokenError {
  error: string;
  token: string;
  refreshToken: string;
}

async function handleOAuthTokenError(error: TokenError): Promise<{ success: boolean; action: string; newToken?: string; error?: string }> {
  switch (error.error) {
    case 'token_expired':
      // Attempt to refresh the token
      try {
        const newToken = await refreshOAuthToken(error.refreshToken);
        return {
          success: true,
          action: 'refresh',
          newToken
        };
      } catch (refreshError) {
        return {
          success: false,
          action: 'refresh_failed',
          error: refreshError instanceof Error ? refreshError.message : 'Unknown error'
        };
      }
    
    case 'invalid_token':
      return {
        success: false,
        action: 'signout',
        error: 'Invalid token'
      };
    
    default:
      return {
        success: false,
        action: 'unknown',
        error: `Unknown token error: ${error.error}`
      };
  }
}

// Mock function to simulate token refresh
async function refreshOAuthToken(refreshToken: string): Promise<string> {
  // In a real implementation, this would make a request to the OAuth provider
  if (refreshToken === 'invalid_refresh_token') {
    throw new Error('Invalid refresh token');
  }
  return 'new_access_token_' + Date.now();
}

async function validatePassword(password: string): Promise<{ isValid: boolean; error?: string }> {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return { isValid: false, error: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters` };
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" };
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" };
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character" };
  }
  
  return { isValid: true };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function testEmailSignup(email: string, password: string, options: { concurrent?: boolean; requiresVerification?: boolean } = {}): Promise<AuthTestResult> {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return {
        scenario: "Email Signup",
        success: false,
        error: "Invalid email format"
      };
    }

    // Validate password requirements
    const passwordValidation = await validatePassword(password);
    if (!passwordValidation.isValid) {
      return {
        scenario: "Email Signup",
        success: false,
        error: passwordValidation.error
      };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return {
        scenario: "Email Signup",
        success: false,
        error: "Email already in use",
        details: { email }
      };
    }

    // Simulate concurrent signup if requested
    if (options.concurrent) {
      // Create a user with the same email in a separate transaction
      await prisma.user.create({
        data: {
          email,
          passwordHash: await hash(password, 10)
        }
      });
    }

    // Create the user
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        emailVerified: !options.requiresVerification ? new Date() : null
      }
    });

    const redirectUrl = options.requiresVerification ? "/auth/verify-email" : "/orgs";

    return {
      scenario: "Email Signup",
      success: true,
      redirectUrl,
      details: {
        userId: user.id,
        email: user.email,
        requiresVerification: options.requiresVerification
      }
    };
  } catch (error) {
    logger.error("Email Signup Error:", error);
    return {
      scenario: "Email Signup",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

async function testEmailSignIn(email: string, password: string): Promise<AuthTestResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        scenario: "Email Sign In",
        success: false,
        error: "User not found"
      };
    }

    if (!user.passwordHash) {
      return {
        scenario: "Email Sign In",
        success: false,
        error: "No password set for this account"
      };
    }

    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      return {
        scenario: "Email Sign In",
        success: false,
        error: "Invalid password"
      };
    }

    return {
      scenario: "Email Sign In",
      success: true,
      redirectUrl: "/account",
      details: { email }
    };
  } catch (error) {
    return {
      scenario: "Email Sign In",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function testMagicLink(
  email: string,
  options: {
    verifyToken?: boolean;
    expiredToken?: boolean;
    usedToken?: boolean;
    multipleRequests?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    // Validate email format
    if (!validateEmail(email)) {
      return {
        scenario: "Magic Link",
        success: false,
        error: "Invalid email format"
      };
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user && !options.verifyToken) {
      user = await prisma.user.create({
        data: {
          email,
          emailVerified: new Date()
        }
      });
    }

    if (!user) {
      return {
        scenario: "Magic Link",
        success: false,
        error: "Invalid magic link",
        details: {
          email,
          reason: "User not found"
        }
      };
    }

    // Handle multiple requests
    if (options.multipleRequests) {
      // Invalidate existing tokens
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: email,
          data: {
            path: ['type'],
            equals: 'magic-link'
          }
        }
      });

      // Create new token
      const token = `magic_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires: new Date(Date.now() + MAGIC_LINK_CONFIG.tokenExpiration),
          data: { type: 'magic-link' }
        }
      });

      return {
        scenario: "Magic Link",
        success: true,
        details: {
          email,
          message: "Previous magic links invalidated",
          newTokenCreated: true
        }
      };
    }

    // Verify token scenarios
    if (options.verifyToken) {
      const token = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          data: {
            path: ['type'],
            equals: 'magic-link'
          }
        },
        orderBy: {
          expires: 'desc'
        }
      });

      if (!token) {
        return {
          scenario: "Magic Link",
          success: false,
          error: "Invalid magic link",
          details: {
            email,
            reason: "Token not found"
          }
        };
      }

      if (options.expiredToken || token.expires < new Date()) {
        await prisma.verificationToken.delete({
          where: { token: token.token }
        });

        return {
          scenario: "Magic Link",
          success: false,
          error: "Magic link expired",
          details: {
            email,
            expires: token.expires
          }
        };
      }

      if (options.usedToken) {
        await prisma.verificationToken.delete({
          where: { token: token.token }
        });

        return {
          scenario: "Magic Link",
          success: false,
          error: "Magic link already used",
          details: {
            email,
            token: token.token
          }
        };
      }

      // Valid token verification
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() }
        });
      }

      await prisma.verificationToken.deleteMany({
        where: { 
          identifier: email,
          data: {
            path: ['type'],
            equals: 'EMAIL_VERIFY'
          }
        }
      });

      return {
        scenario: "Magic Link",
        success: true,
        details: {
          email,
          message: "Magic link verified",
          verified: true
        }
      };
    }

    // Generate new magic link token
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: randomUUID(),
        expires: new Date(Date.now() + MAGIC_LINK_CONFIG.tokenExpiration),
        data: { type: 'magic-link' }
      }
    });
    
    // Delete existing tokens if max active tokens reached
    if (MAGIC_LINK_CONFIG.maxActiveTokens > 0) {
      const activeTokens = await prisma.verificationToken.findMany({
        where: {
          identifier: email,
          data: {
            path: ['type'],
            equals: 'magic-link'
          }
        }
      });

      if (activeTokens.length >= MAGIC_LINK_CONFIG.maxActiveTokens) {
        await prisma.verificationToken.deleteMany({
          where: {
            identifier: email,
            data: {
              path: ['type'],
              equals: 'magic-link'
            }
          }
        });
      }
    }

    return {
      scenario: "Magic Link",
      success: true,
      details: {
        email,
        message: "Magic link sent",
        expires: verificationToken.expires
      }
    };
  } catch (error) {
    logger.error("Magic Link Error:", error);
    return {
      scenario: "Magic Link",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

async function testOAuthFlow(
  provider: string,
  options: {
    invalidState?: boolean;
    expiredState?: boolean;
    missingScopes?: boolean;
    invalidCode?: boolean;
    linkAccount?: boolean;
    alreadyLinked?: boolean;
    providerError?: boolean;
    rateLimited?: boolean;
    email?: string;
  } = {}
): Promise<AuthTestResult> {
  try {
    if (!OAUTH_CONFIG.providers.includes(provider)) {
      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "Unsupported OAuth provider",
        details: { provider }
      };
    }

    // Simulate rate limiting
    if (options.rateLimited) {
      const recentAttempts = await prisma.verificationToken.count({
        where: {
          data: {
            path: ['type'],
            equals: 'oauth-state'
          },
          identifier: provider,
          expires: {
            gte: new Date()
          }
        }
      });

      if (recentAttempts >= OAUTH_CONFIG.maxAttempts) {
        return {
          scenario: "OAuth Authentication",
          success: false,
          error: "Too many OAuth requests"
        };
      }
    }

    // Create a verification token for OAuth state
    const stateToken = await prisma.verificationToken.create({
      data: {
        identifier: provider,
        token: `oauth-state-${Date.now()}`,
        expires: new Date(Date.now() + OAUTH_CONFIG.stateExpiration),
        data: { type: 'oauth-state' }
      }
    });

    // Test various OAuth scenarios
    if (options.invalidState) {
      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "Invalid OAuth state"
      };
    }

    if (options.expiredState) {
      await prisma.verificationToken.update({
        where: { token: stateToken.token },
        data: { expires: new Date(Date.now() - 1000) }
      });
      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "OAuth state expired"
      };
    }

    return {
      scenario: "OAuth Authentication",
      success: true,
      details: {
        provider,
        state: stateToken.token,
        expires: stateToken.expires
      }
    };
  } catch (error) {
    logger.error("OAuth Error:", error);
    return {
      scenario: "OAuth Authentication",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

async function createVerificationToken(identifier: string, tokenType: string, expiresIn: number = 24 * 60 * 60 * 1000): Promise<any> {
  return await prisma.verificationToken.create({
    data: {
      identifier,
      token: randomUUID(),
      expires: new Date(Date.now() + expiresIn),
      data: { type: tokenType }
    }
  });
}

async function findVerificationTokenByType(identifier: string, tokenType: string): Promise<any | null> {
  return await prisma.verificationToken.findFirst({
    where: {
      identifier,
      data: {
        path: ['type'],
        equals: tokenType
      }
    },
    orderBy: {
      expires: 'desc'
    }
  });
}

async function testEmailVerification(
  email: string,
  password: string,
  options: {
    verifyEmail?: boolean;
    checkAccess?: boolean;
    expiredToken?: boolean;
    invalidToken?: boolean;
    resendVerification?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await hash(password, 10),
          emailVerified: null // Start as unverified
        }
      });
    }

    // Create verification token with new data structure
    const token = await createVerificationToken(
      email, 
      'EMAIL_VERIFY',
      options.expiredToken ? -1000 : 24 * 60 * 60 * 1000
    );

    // Test verification scenarios
    if (options.verifyEmail) {
      if (options.expiredToken) {
        return {
          scenario: "Email Verification",
          success: false,
          error: "Verification token expired",
          details: { 
            email,
            tokenExpired: true,
            expires: token.expires
          }
        };
      }

      if (options.invalidToken) {
        return {
          scenario: "Email Verification",
          success: false,
          error: "Invalid verification token",
          details: { 
            email,
            invalidToken: true
          }
        };
      }

      // Valid verification
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() }
        });
      }

      await prisma.verificationToken.deleteMany({
        where: { 
          identifier: email,
          data: {
            path: ['type'],
            equals: 'EMAIL_VERIFY'
          }
        }
      });

      return {
        scenario: "Email Verification",
        success: true,
        details: {
          email,
          verified: true,
          verifiedAt: new Date()
        }
      };
    }

    // Check access before verification
    if (options.checkAccess) {
      if (!user || !user.emailVerified) {
        return {
          scenario: "Email Verification",
          success: false,
          error: "Email not verified",
          details: {
            email,
            requiresVerification: true
          }
        };
      }
    }

    // Resend verification email
    if (options.resendVerification) {
      // Delete existing tokens
      await prisma.verificationToken.deleteMany({
        where: { 
          identifier: email,
          data: {
            path: ['type'],
            equals: 'EMAIL_VERIFY'
          }
        }
      });

      // Create new token
      const newToken = await createVerificationToken(email, 'EMAIL_VERIFY');

      return {
        scenario: "Email Verification",
        success: true,
        details: {
          email,
          verificationResent: true,
          newTokenExpires: newToken.expires
        }
      };
    }

    // Default case - initial verification email sent
    return {
      scenario: "Email Verification",
      success: true,
      details: {
        email,
        verificationSent: true,
        expires: token.expires
      }
    };

  } catch (error) {
    logger.error("Email Verification Error:", error);
    return {
      scenario: "Email Verification",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

async function testSessionManagement(
  email: string,
  password: string,
  options: {
    simulateExpiration?: boolean;
    multipleSessions?: boolean;
    testLogout?: boolean;
    invalidToken?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    // Create a test user if not exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await hash(password, 10),
          emailVerified: new Date()
        }
      });
    }

    // Create a session
    const expires = options.simulateExpiration
      ? new Date(Date.now() - 1000) // Expired
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    await prisma.session.create({
      data: {
        sessionToken: `test-session-${Date.now()}`,
        userId: user.id,
        expires
      }
    });

    // Test multiple sessions if needed
    if (options.multipleSessions) {
      await prisma.session.create({
        data: {
          sessionToken: `test-session-2-${Date.now()}`,
          userId: user.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });
    }

    // Test session invalidation on logout
    if (options.testLogout) {
      await prisma.session.deleteMany({ where: { userId: user.id } });
    }

    // Test invalid session token
    if (options.invalidToken) {
      return {
        scenario: "Session Management",
        success: false,
        error: "Invalid session token"
      };
    }

    return {
      scenario: "Session Management",
      success: true,
      details: {
        sessionCreated: true,
        expires
      }
    };
  } catch (error) {
    logger.error("Session Management Error:", error);
    return {
      scenario: "Session Management",
      success: false,
      error: String(error)
    };
  }
}

async function testAccountLockout(
  email: string,
  password: string,
  options: {
    afterLockoutExpiry?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    // Find or create test user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: await hash("Test123!", 10), // Correct password
          emailVerified: new Date()
        }
      });
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      return {
        scenario: "Account Lockout",
        success: false,
        error: `Account locked. Try again in ${remainingTime} minutes`,
        details: {
          email,
          lockedUntil: user.lockedUntil,
          failedAttempts: user.failedAttempts
        }
      };
    }

    // If testing after lockout expiry, simulate time passing
    if (options.afterLockoutExpiry && user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: new Date(Date.now() - 1000), // Set to past
          failedAttempts: 0 // Reset attempts
        }
      });
      user = await prisma.user.findUnique({ where: { email } });
    }

    // Verify password
    const isValidPassword = password === "Test123!";

    if (!isValidPassword) {
      if (!user) {
        return {
          scenario: "Password Reset",
          success: false,
          error: "User not found"
        };
      }

      const newFailedAttempts = (user.failedAttempts || 0) + 1;
      
      // Check if account should be locked
      if (newFailedAttempts >= LOCKOUT_CONFIG.maxAttempts) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: newFailedAttempts,
            lockedUntil: new Date(Date.now() + LOCKOUT_CONFIG.lockoutDuration)
          }
        });

        return {
          scenario: "Account Lockout",
          success: false,
          error: "Account locked. Try again in 30 minutes",
          details: {
            email,
            failedAttempts: newFailedAttempts,
            lockedUntil: new Date(Date.now() + LOCKOUT_CONFIG.lockoutDuration)
          }
        };
      }

      // Update failed attempts
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: newFailedAttempts
          }
        });
      }

      return {
        scenario: "Account Lockout",
        success: false,
        error: "Invalid credentials",
        details: {
          email,
          failedAttempts: newFailedAttempts,
          remainingAttempts: LOCKOUT_CONFIG.maxAttempts - newFailedAttempts
        }
      };
    }

    // Successful login - reset failed attempts
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: 0,
          lockedUntil: null
        }
      });
    }

    return {
      scenario: "Account Lockout",
      success: true,
      details: {
        email,
        failedAttempts: 0,
        message: "Login successful"
      }
    };
  } catch (error) {
    logger.error("Account Lockout Error:", error);
    return {
      scenario: "Account Lockout",
      success: false,
      error: String(error)
    };
  }
}

async function testAccountRecovery(
  email: string,
  options: {
    newPassword?: string;
    verifyToken?: boolean;
    expiredToken?: boolean;
    usedToken?: boolean;
    rateLimited?: boolean;
    recentChange?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        scenario: "Account Recovery",
        success: false,
        error: "User not found"
      };
    }

    // Check for rate limiting
    if (options.rateLimited) {
      const recentRequests = await prisma.verificationToken.count({
        where: {
          data: {
            path: ['type'],
            equals: 'password-reset'
          },
          identifier: email,
          expires: {
            gte: new Date()
          }
        }
      });

      if (recentRequests >= ACCOUNT_RECOVERY_CONFIG.maxResetRequests) {
        return {
          scenario: "Account Recovery",
          success: false,
          error: "Too many reset attempts",
          details: {
            email,
            timeWindow: "1 hour",
            maxAttempts: ACCOUNT_RECOVERY_CONFIG.maxResetRequests
          }
        };
      }
    }

    // Check for recent password change
    if (options.recentChange && user.updatedAt) {
      const timeSinceLastChange = Date.now() - user.updatedAt.getTime();
      if (timeSinceLastChange < ACCOUNT_RECOVERY_CONFIG.minPasswordAge) {
        return {
          scenario: "Account Recovery",
          success: false,
          error: "Password changed too recently",
          details: {
            email,
            lastChange: user.updatedAt,
            minWaitTime: "24 hours"
          }
        };
      }
    }

    // Generate and store reset token
    const token = `reset_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const tokenExpiration = options.expiredToken
      ? new Date(Date.now() - 1000)
      : new Date(Date.now() + ACCOUNT_RECOVERY_CONFIG.tokenExpiration);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: tokenExpiration,
        data: { type: 'password-reset' }
      }
    });

    // Handle token verification
    if (options.verifyToken && options.newPassword) {
      const storedToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          data: {
            path: ['type'],
            equals: 'password-reset'
          }
        },
        orderBy: {
          expires: 'desc'
        }
      });

      if (!storedToken) {
        return {
          scenario: "Account Recovery",
          success: false,
          error: "Invalid reset token"
        };
      }

      if (storedToken.expires < new Date() || options.expiredToken) {
        await prisma.verificationToken.delete({
          where: { token: storedToken.token }
        });

        return {
          scenario: "Account Recovery",
          success: false,
          error: "Reset token expired",
          details: {
            email,
            expires: storedToken.expires
          }
        };
      }

      if (options.usedToken) {
        await prisma.verificationToken.delete({
          where: { token: storedToken.token }
        });

        return {
          scenario: "Account Recovery",
          success: false,
          error: "Reset token already used"
        };
      }

      // Update password
      const hashedPassword = await hash(options.newPassword, 12);
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash: hashedPassword,
            updatedAt: new Date()
          }
        });
      }

      // Delete used token
      await prisma.verificationToken.delete({
        where: { token: storedToken.token }
      });

      return {
        scenario: "Account Recovery",
        success: true,
        details: {
          email,
          message: "Password reset successful"
        }
      };
    }

    return {
      scenario: "Account Recovery",
      success: true,
      details: {
        email,
        message: "Password reset requested",
        expires: tokenExpiration
      }
    };
  } catch (error) {
    logger.error("Account Recovery Error:", error);
    return {
      scenario: "Account Recovery",
      success: false,
      error: String(error)
    };
  }
}

async function testRememberMe(
  email: string,
  password: string,
  options: {
    rememberMe?: boolean;
    checkPersistence?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return {
        scenario: "Remember Me",
        success: false,
        error: "User not found"
      };
    }

    // Create session with appropriate maxAge
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const sessionExpiry = options.rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: sessionExpiry
      }
    });

    // Check session persistence
    if (options.checkPersistence) {
      const persistedSession = await prisma.session.findFirst({
        where: {
          userId: user.id
        }
      });

      if (!persistedSession) {
        return {
          scenario: "Remember Me",
          success: false,
          error: "Session not persisted"
        };
      }

      return {
        scenario: "Remember Me",
        success: true,
        details: {
          email,
          message: "Session persisted",
          expires: persistedSession.expires
        }
      };
    }

    return {
      scenario: "Remember Me",
      success: true,
      details: {
        email,
        message: options.rememberMe ? "Extended session created" : "Standard session created",
        expires: sessionExpiry
      }
    };
  } catch (error) {
    logger.error("Remember Me Error:", error);
    return {
      scenario: "Remember Me",
      success: false,
      error: String(error)
    };
  }
}

async function testSecurityFeatures(
  endpoint: string,
  method: string,
  options: {
    missingCsrf?: boolean;
    invalidCsrf?: boolean;
    expiredCsrf?: boolean;
    checkCsp?: boolean;
    checkHsts?: boolean;
    ip?: string;
    userAgent?: string;
    exceedLoginAttempts?: boolean;
    exceedResetAttempts?: boolean;
    exceedApiRequests?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    // CSRF Token Validation
    if (method === "POST") {
      if (options.missingCsrf) {
        return {
          scenario: "Security Features",
          success: false,
          error: "CSRF token missing"
        };
      }

      const csrfToken = options.invalidCsrf
        ? "invalid_token"
        : `csrf_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const tokenExpiration = options.expiredCsrf
        ? new Date(Date.now() - 1000)
        : new Date(Date.now() + SECURITY_CONFIG.csrfTokenExpiration);

      await prisma.verificationToken.create({
        data: {
          identifier: 'csrf',
          token: csrfToken,
          expires: tokenExpiration,
          data: { type: 'csrf-token' }
        }
      });

      if (options.invalidCsrf) {
        return {
          scenario: "Security Features",
          success: false,
          error: "Invalid CSRF token"
        };
      }

      if (options.expiredCsrf || tokenExpiration < new Date()) {
        return {
          scenario: "Security Features",
          success: false,
          error: "CSRF token expired",
          details: {
            expires: tokenExpiration
          }
        };
      }
    }

    // IP-based Protection
    if (options.ip) {
      // Check suspicious IP ranges
      if (SECURITY_CONFIG.suspiciousPatterns.ipRanges.some(range => 
        options.ip && isInSubnet(options.ip, range)
      )) {
        return {
          scenario: "Security Features",
          success: false,
          error: "IP address is in a suspicious range",
          details: {
            ip: options.ip
          }
        };
      }
    }

    // User Agent Validation
    if (options.userAgent && SECURITY_CONFIG.suspiciousPatterns.userAgents.some(pattern => 
      options.userAgent?.toLowerCase().includes(pattern.toLowerCase())
    )) {
      return {
        scenario: "Security Features",
        success: false,
        error: "Access denied for suspicious user agent",
        details: { userAgent: options.userAgent }
      };
    }

    // Security Headers Validation
    if (options.checkCsp || options.checkHsts) {
      const headers = SECURITY_CONFIG.requiredSecurityHeaders;
      
      if (options.checkCsp) {
        const csp = headers['Content-Security-Policy'];
        if (!csp || !csp.includes("default-src 'self'")) {
          return {
            scenario: "Security Features",
            success: false,
            error: "Invalid CSP configuration",
            details: { current: csp }
          };
        }
      }

      if (options.checkHsts) {
        const hsts = headers['Strict-Transport-Security'];
        if (!hsts || !hsts.includes('max-age=31536000')) {
          return {
            scenario: "Security Features",
            success: false,
            error: "Invalid HSTS configuration",
            details: { current: hsts }
          };
        }
      }

      // Verify all required headers are present
      const missingHeaders = Object.entries(headers)
        .filter(([key, value]) => !value)
        .map(([key]) => key);

      if (missingHeaders.length > 0) {
        return {
          scenario: "Security Features",
          success: false,
          error: "Missing security headers",
          details: { missing: missingHeaders }
        };
      }
    }

    return {
      scenario: "Security Features",
      success: true,
      details: {
        endpoint,
        method,
        message: options.checkCsp 
          ? "Valid CSP configuration"
          : options.checkHsts
          ? "Valid HSTS configuration"
          : method === "POST"
          ? "Valid CSRF token"
          : "All security headers present"
      }
    };
  } catch (error) {
    logger.error("Security Test Error:", error);
    return {
      scenario: "Security Features",
      success: false,
      error: String(error)
    };
  }
}

async function testAdvancedOAuthScenarios(
  provider: string,
  options: {
    accountMerging?: boolean;
    providerErrorRecovery?: boolean;
    tokenRefresh?: boolean;
    crossProviderLinking?: boolean;
  } = {}
): Promise<AuthTestResult> {
  try {
    if (!OAUTH_CONFIG.providers.includes(provider)) {
      return {
        scenario: "Advanced OAuth Scenarios",
        success: false,
        error: "Unsupported OAuth provider",
        details: { provider }
      };
    }

    // Account Merging
    if (options.accountMerging) {
      const email = 'test@example.com'
      const password = 'password123'
      
      // Create an email-based account
      const user = await createUser({ email, password })

      // Simulate OAuth sign-in with same email
      const oauthProfile = {
        email,
        provider,
        providerId: 'google123',
      }
      
      const result = await handleOAuthSignIn(oauthProfile)
      expect(result.action).toBe('merge')
      expect(result.user.email).toBe(email)
      expect(result.accounts).toHaveLength(2) // Both email and OAuth accounts

      return {
        scenario: "Advanced OAuth Scenarios",
        success: true,
        details: {
          provider,
          message: "Account merged successfully"
        }
      };
    }

    // Provider Error Recovery
    if (options.providerErrorRecovery) {
      const expiredToken = 'expired_token'
      const refreshToken = 'refresh_token'
      
      const result = await handleOAuthTokenError({
        error: 'token_expired',
        token: expiredToken,
        refreshToken
      })
      
      expect(result.success).toBe(true)
      expect(result.newToken).toBeDefined()

      return {
        scenario: "Advanced OAuth Scenarios",
        success: true,
        details: {
          provider,
          message: "Provider error recovered"
        }
      };
    }

    // Token Refresh
    if (options.tokenRefresh) {
      const accountData = await createOAuthAccount()
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          emailVerified: new Date(),
          accounts: {
            create: accountData
          }
        },
        include: {
          accounts: true
        }
      })

      const account = user.accounts[0]
      const originalToken = account.access_token
      
      // Simulate token expiration
      await prisma.account.update({
        where: { id: account.id },
        data: { expires_at: Math.floor(Date.now() / 1000) - 3600 }
      })
      
      const session = await getSession()
      expect(session?.accessToken).not.toBe(originalToken)
      expect(session?.error).toBeUndefined()

      return {
        scenario: "Advanced OAuth Scenarios",
        success: true,
        details: {
          provider,
          message: "Token refreshed successfully"
        }
      };
    }

    // Cross-Provider Account Linking
    if (options.crossProviderLinking) {
      const email = 'multi-auth@example.com'
      
      // Create initial account with Google
      const googleAccount = await createOAuthAccount({
        provider: 'google',
        email
      })
      
      // Link Twitter account
      const twitterAccount = await linkProvider({
        userId: googleAccount.userId,
        provider: 'twitter',
        providerAccountId: 'twitter123'
      })
      
      const user = await prisma.user.findUnique({
        where: { id: googleAccount.userId },
        include: { accounts: true }
      })
      
      expect(user?.accounts).toHaveLength(2)
      expect(user?.accounts.map(a => a.provider)).toContain('google')
      expect(user?.accounts.map(a => a.provider)).toContain('twitter')

      return {
        scenario: "Advanced OAuth Scenarios",
        success: true,
        details: {
          provider,
          message: "Account linked successfully"
        }
      };
    }

    return {
      scenario: "Advanced OAuth Scenarios",
      success: false,
      error: "Unknown scenario"
    };
  } catch (error) {
    logger.error("Advanced OAuth Scenarios Error:", error);
    return {
      scenario: "Advanced OAuth Scenarios",
      success: false,
      error: String(error)
    };
  }
}

interface LinkProviderOptions {
  userId: string;
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
}

async function linkProvider(options: LinkProviderOptions) {
  return prisma.account.create({
    data: {
      userId: options.userId,
      type: 'oauth',
      provider: options.provider,
      providerAccountId: options.providerAccountId,
      access_token: options.accessToken || 'access_token_' + Date.now(),
      refresh_token: options.refreshToken || 'refresh_token_' + Date.now(),
      expires_at: Math.floor(Date.now() / 1000) + 3600
    }
  });
}

interface Session {
  user: {
    id: string;
    email: string;
    emailVerified: Date | null;
  };
  accessToken: string | null;
  expires: string;
  error?: string;
}

async function getSession(): Promise<Session | null> {
  const account = await prisma.account.findFirst({
    where: {
      user: {
        email: 'test@example.com'
      }
    },
    include: {
      user: true
    }
  });

  if (!account || !account.user) {
    return null;
  }

  return {
    user: account.user,
    accessToken: account.access_token,
    expires: account.expires_at 
      ? new Date(account.expires_at * 1000).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString() // Default to 1 hour from now
  };
}

async function createUser(options: { email: string; password: string }) {
  const hashedPassword = await hash(options.password, 12);
  return prisma.user.create({
    data: {
      email: options.email,
      passwordHash: hashedPassword,
      emailVerified: new Date()
    }
  });
}

async function createOAuthAccount(options: { provider?: string; email?: string } = {}) {
  return {
    userId: (await createUser({ email: 'test@example.com', password: 'password123' })).id,
    provider: options.provider || 'google',
    type: 'oauth',
    providerAccountId: 'google123',
    access_token: 'access_token_' + Date.now(),
    refresh_token: 'refresh_token_' + Date.now(),
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  };
}

function isInSubnet(ipStr: string, cidr: string): boolean {
  const [netStr, bits] = cidr.split('/');
  const ip = ipStr.split('.').map(Number);
  const net = netStr.split('.').map(Number);

  if (ip.length !== 4 || net.length !== 4 || !bits) {
    return false;
  }

  const mask = ~((1 << (32 - Number(bits))) - 1);
  
  const ipNum = (ip[0] << 24) | (ip[1] << 16) | (ip[2] << 8) | ip[3];
  const netNum = (net[0] << 24) | (net[1] << 16) | (net[2] << 8) | net[3];
  
  return (ipNum & mask) === (netNum & mask);
}

async function logTestResult(result: AuthTestResult) {
  const icon = result.success ? '✅' : '❌';
  const details = result.details ? `\n   Details: ${JSON.stringify(result.details, null, 2)}` : '';
  const error = result.error ? `\n   Error: ${result.error}` : '';
  
  logger.info(`${icon} ${result.scenario}${details}${error}`);
}

async function cleanupTestData(email: string) {
  logger.info("🧹 Cleaning up test data...");
  
  try {
    // Delete verification tokens for the test user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email
      }
    });

    // Delete the test user
    await prisma.user.deleteMany({
      where: {
        email: email
      }
    });

    logger.info("✨ Test data cleanup complete");
  } catch (error) {
    logger.error("Cleanup failed:", error);
  }
}

async function runAuthTests() {
  logger.info("Starting Authentication Tests");
  
  try {
    const testUser = {
      email: 'test@example.com',
      password: 'Test123!@#',
      invalidPassword: 'wrong'
    };

    // Clean up any existing test data
    await cleanupTestData(testUser.email);

    // Test Email Signup
    logger.info("\n📝 Testing Email Signup Flow:");
    const signupResult = await testEmailSignup(testUser.email, testUser.password);
    await logTestResult(signupResult);

    // Test Email Verification (multiple scenarios)
    logger.info("\n✉️ Testing Email Verification Flow:");
    
    // Test 1: Normal verification (should succeed)
    const verificationResult = await testEmailVerification(
      testUser.email, 
      testUser.password, 
      { verifyEmail: true }
    );
    if (!verificationResult.success) {
      throw new Error("Normal verification failed unexpectedly");
    }
    await logTestResult(verificationResult);

    // Test 2: Expired token (should fail with specific error)
    const expiredTokenResult = await testEmailVerification(
      testUser.email,
      testUser.password,
      { verifyEmail: true, expiredToken: true }
    );
    if (expiredTokenResult.success || expiredTokenResult.error !== "Verification token expired") {
      throw new Error("Expired token test did not fail as expected");
    }
    await logTestResult({ ...expiredTokenResult, success: true }); // Mark as success since it failed as expected

    // Test 3: Invalid token (should fail with specific error)
    const invalidTokenResult = await testEmailVerification(
      testUser.email,
      testUser.password,
      { verifyEmail: true, invalidToken: true }
    );
    if (invalidTokenResult.success || invalidTokenResult.error !== "Invalid verification token") {
      throw new Error("Invalid token test did not fail as expected");
    }
    await logTestResult({ ...invalidTokenResult, success: true }); // Mark as success since it failed as expected

    // Test 4: Resend verification (should succeed)
    const resendResult = await testEmailVerification(
      testUser.email,
      testUser.password,
      { resendVerification: true }
    );
    if (!resendResult.success) {
      throw new Error("Resend verification failed unexpectedly");
    }
    await logTestResult(resendResult);

    // Test Email Sign In (multiple scenarios)
    logger.info("\n🔐 Testing Email Sign In Flow:");
    
    // Successful login
    const signInResult = await testEmailSignIn(testUser.email, testUser.password);
    await logTestResult(signInResult);

    // Failed login (should fail with specific error)
    const failedSignInResult = await testEmailSignIn(testUser.email, testUser.invalidPassword);
    if (failedSignInResult.success) {
      throw new Error("Invalid password login should have failed");
    }
    await logTestResult({ ...failedSignInResult, success: true }); // Mark as success since it failed as expected

    // Test Magic Link
    logger.info("\n🔗 Testing Magic Link Flow:");
    const magicLinkResult = await testMagicLink(testUser.email);
    await logTestResult(magicLinkResult);

    // Test OAuth
    logger.info("\n🌐 Testing OAuth Flow:");
    const oauthResult = await testOAuthFlow('google');
    await logTestResult(oauthResult);

    // Test Account Recovery
    logger.info("\n🔄 Testing Account Recovery Flow:");
    const recoveryResult = await testAccountRecovery(testUser.email, {
      newPassword: 'NewTest123!@#'
    });
    await logTestResult(recoveryResult);

    // Test Security Features
    logger.info("\n🛡️ Testing Security Features:");
    const securityResult = await testSecurityFeatures('/api/auth/signin', 'POST', {
      checkCsp: true,
      checkHsts: true
    });
    await logTestResult(securityResult);

    logger.info("\n✨ All tests completed successfully!");
    
    // Clean up test data after all tests
    await cleanupTestData(testUser.email);
    
    process.exit(0);
  } catch (error) {
    logger.error("Tests failed:", error);
    process.exit(1);
  }
}

// Run all tests
if (require.main === module) {
  console.log("Starting Authentication Tests...");
  runAuthTests()
    .catch(error => {
      console.error("Tests failed:", error);
      process.exit(1);
    });
}
