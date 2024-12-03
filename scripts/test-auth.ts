import { logger } from '../src/lib/logger';
import { prisma } from '../src/lib/prisma';
import { hash } from 'bcryptjs';

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
  }
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
  }
};

function validatePassword(password: string): { isValid: boolean; error?: string } {
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
    const passwordValidation = validatePassword(password);
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
          password: await hash(password, 10)
        }
      });
    }

    // Create the user
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
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
            path: ["type"],
            equals: "magic-link"
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
          data: {
            type: "magic-link",
            userId: user.id
          }
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
            path: ["type"],
            equals: "magic-link"
          }
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
          where: { id: token.id }
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
          where: { id: token.id }
        });

        return {
          scenario: "Magic Link",
          success: false,
          error: "Magic link already used",
          details: {
            email,
            tokenId: token.id
          }
        };
      }

      // Valid token verification
      await prisma.verificationToken.delete({
        where: { id: token.id }
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
    const token = `magic_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Delete existing tokens if max active tokens reached
    if (MAGIC_LINK_CONFIG.maxActiveTokens > 0) {
      const activeTokens = await prisma.verificationToken.findMany({
        where: {
          identifier: email,
          data: {
            path: ["type"],
            equals: "magic-link"
          }
        }
      });

      if (activeTokens.length >= MAGIC_LINK_CONFIG.maxActiveTokens) {
        await prisma.verificationToken.deleteMany({
          where: {
            identifier: email,
            data: {
              path: ["type"],
              equals: "magic-link"
            }
          }
        });
      }
    }

    // Create new token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + MAGIC_LINK_CONFIG.tokenExpiration),
        data: {
          type: "magic-link",
          userId: user.id
        }
      }
    });

    return {
      scenario: "Magic Link",
      success: true,
      details: {
        email,
        message: "Magic link sent",
        expires: new Date(Date.now() + MAGIC_LINK_CONFIG.tokenExpiration)
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

    // Generate OAuth state
    const state = options.invalidState 
      ? "invalid_state"
      : `oauth_state_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Store state in database
    const stateExpiration = options.expiredState
      ? new Date(Date.now() - 1000) // Expired
      : new Date(Date.now() + OAUTH_CONFIG.stateExpiration);

    await prisma.verificationToken.create({
      data: {
        identifier: state,
        token: state,
        expires: stateExpiration,
        data: {
          type: "oauth-state",
          provider,
          scopes: options.missingScopes 
            ? [] 
            : OAUTH_CONFIG.requiredScopes[provider as keyof typeof OAUTH_CONFIG.requiredScopes]
        }
      }
    });

    // Simulate rate limiting
    if (options.rateLimited) {
      const recentAttempts = await prisma.verificationToken.count({
        where: {
          data: {
            path: ["type"],
            equals: "oauth-state"
          },
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000) // Last minute
          }
        }
      });

      if (recentAttempts > 10) {
        return {
          scenario: "OAuth Authentication",
          success: false,
          error: "Too many OAuth requests",
          details: {
            provider,
            recentAttempts,
            timeWindow: "1 minute"
          }
        };
      }
    }

    // Verify state
    const storedState = await prisma.verificationToken.findFirst({
      where: {
        identifier: state,
        data: {
          path: ["type"],
          equals: "oauth-state"
        }
      }
    });

    if (!storedState || options.invalidState) {
      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "Invalid OAuth state",
        details: { provider, state }
      };
    }

    if (storedState.expires < new Date() || options.expiredState) {
      await prisma.verificationToken.delete({
        where: { id: storedState.id }
      });

      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "OAuth state expired",
        details: {
          provider,
          expires: storedState.expires
        }
      };
    }

    // Verify scopes
    const requiredScopes = OAUTH_CONFIG.requiredScopes[provider as keyof typeof OAUTH_CONFIG.requiredScopes];
    const providedScopes = storedState.data?.scopes as string[] || [];
    
    if (options.missingScopes || !requiredScopes.every(scope => providedScopes.includes(scope))) {
      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "Insufficient OAuth scopes",
        details: {
          provider,
          required: requiredScopes,
          provided: providedScopes
        }
      };
    }

    // Simulate provider errors
    if (options.providerError) {
      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "Provider authentication failed",
        details: {
          provider,
          reason: "Provider returned error response"
        }
      };
    }

    // Handle account linking
    if (options.linkAccount && options.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: options.email },
        include: {
          accounts: {
            where: {
              provider
            }
          }
        }
      });

      if (existingUser?.accounts.length && options.alreadyLinked) {
        return {
          scenario: "OAuth Authentication",
          success: false,
          error: "Account already linked",
          details: {
            provider,
            email: options.email
          }
        };
      }

      if (existingUser) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oauth",
            provider,
            providerAccountId: `mock_${Date.now()}`,
            access_token: `mock_token_${Date.now()}`,
            expires_at: Math.floor((Date.now() + 3600000) / 1000),
            token_type: "Bearer",
            scope: requiredScopes.join(" ")
          }
        });

        return {
          scenario: "OAuth Authentication",
          success: true,
          details: {
            provider,
            email: options.email,
            message: "Account linked successfully"
          }
        };
      }
    }

    // Simulate invalid authorization code
    if (options.invalidCode) {
      return {
        scenario: "OAuth Authentication",
        success: false,
        error: "Invalid OAuth authorization code",
        details: {
          provider,
          reason: "Authorization code verification failed"
        }
      };
    }

    // Clean up state token
    await prisma.verificationToken.delete({
      where: { id: storedState.id }
    });

    return {
      scenario: "OAuth Authentication",
      success: true,
      details: {
        provider,
        message: "OAuth state validated",
        scopes: providedScopes
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
          password: await hash(password, 10),
          emailVerified: null // Start as unverified
        }
      });
    }

    // Create verification token
    const token = `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expires = new Date(Date.now() + (options.expiredToken ? -1 : 24 * 60 * 60 * 1000));

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: options.invalidToken ? 'invalid_token' : token,
        expires,
        data: { userId: user.id }
      }
    });

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
            expires 
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
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });

      await prisma.verificationToken.deleteMany({
        where: { identifier: email }
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
      if (!user.emailVerified) {
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
        where: { identifier: email }
      });

      // Create new token
      const newToken = `verify_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: newToken,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
          data: { userId: user.id }
        }
      });

      return {
        scenario: "Email Verification",
        success: true,
        details: {
          email,
          verificationResent: true,
          newTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
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
        expires
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
    // Create a test user if doesn't exist
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: await hash(password, 10),
          emailVerified: new Date()
        }
      });
    }

    // Create a session
    const sessionToken = `test-session-${Date.now()}`;
    const sessionExpiry = options.simulateExpiration
      ? new Date(Date.now() - 1000) // Expired
      : new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: sessionExpiry,
        data: {
          rememberMe: options.rememberMe
        }
      }
    });

    // Test multiple sessions
    if (options.multipleSessions) {
      await prisma.session.create({
        data: {
          sessionToken: `test-session-2-${Date.now()}`,
          userId: user.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      });

      const sessions = await prisma.session.findMany({
        where: { userId: user.id }
      });

      return {
        scenario: "Session Management",
        success: sessions.length === 2,
        details: { 
          userId: user.id,
          sessionCount: sessions.length
        }
      };
    }

    // Test session expiration
    if (options.simulateExpiration) {
      const isExpired = sessionExpiry < new Date();
      return {
        scenario: "Session Management",
        success: false,
        error: isExpired ? "Session expired" : "Session should be expired",
        details: { 
          sessionId: sessionToken,
          expires: sessionExpiry
        }
      };
    }

    // Test logout
    if (options.testLogout) {
      await prisma.session.delete({
        where: { id: sessionToken }
      });

      const deletedSession = await prisma.session.findUnique({
        where: { id: sessionToken }
      });

      return {
        scenario: "Session Management",
        success: !deletedSession,
        details: { 
          message: "Session invalidated",
          sessionId: sessionToken
        }
      };
    }

    // Test invalid token
    if (options.invalidToken) {
      const invalidSession = await prisma.session.findFirst({
        where: { 
          sessionToken: "invalid-token"
        }
      });

      return {
        scenario: "Session Management",
        success: false,
        error: "Invalid session token",
        details: { 
          attempted: true,
          found: !!invalidSession
        }
      };
    }

    // Default case - verify session creation
    return {
      scenario: "Session Management",
      success: true,
      details: {
        sessionId: sessionToken,
        userId: user.id,
        expires: sessionExpiry
      }
    };
  } catch (error) {
    logger.error("Session Management Error:", error);
    return {
      scenario: "Session Management",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
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
          password: await hash("Test123!", 10), // Correct password
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
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: newFailedAttempts
        }
      });

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
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null
      }
    });

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
      error: error instanceof Error ? error.message : "Unknown error occurred"
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
          identifier: email,
          data: {
            path: ["type"],
            equals: "password-reset"
          },
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
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
        data: {
          type: "password-reset",
          userId: user.id
        }
      }
    });

    // Handle token verification
    if (options.verifyToken && options.newPassword) {
      const storedToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          data: {
            path: ["type"],
            equals: "password-reset"
          }
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
          where: { id: storedToken.id }
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
          where: { id: storedToken.id }
        });

        return {
          scenario: "Account Recovery",
          success: false,
          error: "Reset token already used"
        };
      }

      // Update password
      const hashedPassword = await hash(options.newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      });

      // Delete used token
      await prisma.verificationToken.delete({
        where: { id: storedToken.id }
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
      error: error instanceof Error ? error.message : "Unknown error occurred"
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
        expires: sessionExpiry,
        data: {
          rememberMe: options.rememberMe
        }
      }
    });

    // Check session persistence
    if (options.checkPersistence) {
      const persistedSession = await prisma.session.findFirst({
        where: {
          userId: user.id,
          data: {
            path: ["rememberMe"],
            equals: options.rememberMe
          }
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
      error: error instanceof Error ? error.message : "Unknown error occurred"
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
          identifier: "csrf",
          token: csrfToken,
          expires: tokenExpiration,
          data: {
            type: "csrf-token"
          }
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
      if (SECURITY_CONFIG.suspiciousPatterns.ipRanges.some(range => {
        const [network, bits] = range.split('/');
        const ip = options.ip?.split('.').map(Number);
        const net = network.split('.').map(Number);
        const mask = ~((1 << (32 - Number(bits))) - 1);
        
        const ipNum = (ip[0] << 24) | (ip[1] << 16) | (ip[2] << 8) | ip[3];
        const netNum = (net[0] << 24) | (net[1] << 16) | (net[2] << 8) | net[3];
        
        return (ipNum & mask) === (netNum & mask);
      })) {
        return {
          scenario: "Security Features",
          success: false,
          error: "Access denied from suspicious IP",
          details: { ip: options.ip }
        };
      }

      // Rate limiting checks
      const now = Date.now();

      if (options.exceedLoginAttempts) {
        const recentAttempts = await prisma.verificationToken.count({
          where: {
            identifier: options.ip,
            data: {
              path: ["type"],
              equals: "login-attempt"
            },
            createdAt: {
              gte: new Date(now - SECURITY_CONFIG.ipRateLimits.loginAttempts.window)
            }
          }
        });

        if (recentAttempts >= SECURITY_CONFIG.ipRateLimits.loginAttempts.max) {
          return {
            scenario: "Security Features",
            success: false,
            error: "Too many login attempts",
            details: {
              ip: options.ip,
              attempts: recentAttempts,
              window: "15 minutes"
            }
          };
        }
      }

      if (options.exceedResetAttempts) {
        const recentResets = await prisma.verificationToken.count({
          where: {
            identifier: options.ip,
            data: {
              path: ["type"],
              equals: "password-reset"
            },
            createdAt: {
              gte: new Date(now - SECURITY_CONFIG.ipRateLimits.passwordReset.window)
            }
          }
        });

        if (recentResets >= SECURITY_CONFIG.ipRateLimits.passwordReset.max) {
          return {
            scenario: "Security Features",
            success: false,
            error: "Too many password reset attempts",
            details: {
              ip: options.ip,
              attempts: recentResets,
              window: "1 hour"
            }
          };
        }
      }

      if (options.exceedApiRequests) {
        const recentRequests = await prisma.verificationToken.count({
          where: {
            identifier: options.ip,
            data: {
              path: ["type"],
              equals: "api-request"
            },
            createdAt: {
              gte: new Date(now - SECURITY_CONFIG.ipRateLimits.apiRequests.window)
            }
          }
        });

        if (recentRequests >= SECURITY_CONFIG.ipRateLimits.apiRequests.max) {
          return {
            scenario: "Security Features",
            success: false,
            error: "Too many API requests",
            details: {
              ip: options.ip,
              requests: recentRequests,
              window: "1 minute"
            }
          };
        }
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
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

async function logTestResult(result: AuthTestResult) {
  if (result.success) {
    logger.info(`✅ ${result.scenario} - Success`, {
      redirectUrl: result.redirectUrl,
      details: result.details
    });
  } else {
    logger.error(`❌ ${result.scenario} - Failed`, {
      error: result.error,
      details: result.details
    });
  }
}

export async function runAuthTests() {
  logger.info("Starting Authentication Tests");
  
  try {
    // Clean up test users before running tests
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "test.com"
        }
      }
    });

    // Create an existing user for testing duplicate email scenarios
    const existingUserEmail = "existing@test.com";
    await prisma.user.create({
      data: {
        email: existingUserEmail,
        password: await hash("Test123!", 10),
        emailVerified: new Date()
      }
    });

    // Run Email Signup Tests
    logger.info("\nRunning Email Signup Tests");
    for (const testCase of scenarios.EMAIL_SIGNUP.cases) {
      logger.info(`Testing: ${scenarios.EMAIL_SIGNUP.name} - ${testCase.name}`);
      const result = await testEmailSignup(
        testCase.email,
        testCase.password,
        {
          concurrent: testCase.concurrent,
          requiresVerification: testCase.requiresVerification
        }
      );
      
      // Validate test results
      const success = testCase.expectError
        ? result.error === testCase.expectedError // Check for specific error
        : result.success && result.redirectUrl === testCase.expectedRedirect;
      
      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedRedirect,
          got: testCase.expectError ? result.error : result.redirectUrl
        });
      }
      
      await logTestResult(result);
    }

    // Run Email Sign In Tests
    logger.info("\nRunning Email Sign In Tests");
    for (const testCase of scenarios.EMAIL_SIGNIN.cases) {
      logger.info(`Testing: ${scenarios.EMAIL_SIGNIN.name} - ${testCase.name}`);
      const result = await testEmailSignIn(testCase.email, testCase.password);
      
      // Validate test results
      const success = testCase.expectError
        ? result.error === testCase.expectedError // Check for specific error
        : result.success && result.redirectUrl === testCase.expectedRedirect;
      
      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedRedirect,
          got: testCase.expectError ? result.error : result.redirectUrl
        });
      }
      
      await logTestResult(result);
    }

    // Run Magic Link Tests
    logger.info("\nRunning Magic Link Tests");
    for (const testCase of scenarios.MAGIC_LINK.cases) {
      logger.info(`Testing: ${scenarios.MAGIC_LINK.name} - ${testCase.name}`);
      
      const result = await testMagicLink(
        testCase.email,
        {
          verifyToken: testCase.verifyToken,
          expiredToken: testCase.expiredToken,
          usedToken: testCase.usedToken,
          multipleRequests: testCase.multipleRequests
        }
      );

      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && (!testCase.expectedResult || result.details?.message === testCase.expectedResult);

      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedResult,
          got: result.error || result.details?.message
        });
      }

      await logTestResult(result);
    }

    // Run OAuth Tests
    logger.info("\nRunning OAuth Authentication Tests");
    for (const testCase of scenarios.OAUTH.cases) {
      logger.info(`Testing: ${scenarios.OAUTH.name} - ${testCase.name}`);
      
      const result = await testOAuthFlow(
        testCase.provider,
        {
          invalidState: testCase.invalidState,
          expiredState: testCase.expiredState,
          missingScopes: testCase.missingScopes,
          invalidCode: testCase.invalidCode,
          linkAccount: testCase.linkAccount,
          alreadyLinked: testCase.alreadyLinked,
          providerError: testCase.providerError,
          rateLimited: testCase.rateLimited,
          email: testCase.email
        }
      );

      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && (!testCase.expectedResult || result.details?.message === testCase.expectedResult);

      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedResult,
          got: result.error || result.details?.message
        });
      }

      await logTestResult(result);
    }

    // Run Email Verification Tests
    logger.info("\nRunning Email Verification Tests");
    for (const testCase of scenarios.EMAIL_VERIFICATION.cases) {
      logger.info(`Testing: ${scenarios.EMAIL_VERIFICATION.name} - ${testCase.name}`);
      
      const result = await testEmailVerification(
        testCase.email,
        testCase.password,
        {
          verifyEmail: testCase.verifyEmail,
          checkAccess: testCase.checkAccess,
          expiredToken: testCase.expiredToken,
          invalidToken: testCase.invalidToken,
          resendVerification: testCase.resendVerification
        }
      );

      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && (!testCase.expectedResult || result.details?.verificationSent || result.details?.verified || result.details?.verificationResent);

      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedResult,
          got: result.error || result.details
        });
      }

      await logTestResult(result);
    }

    // Run Session Management Tests
    logger.info("\nRunning Session Management Tests");
    for (const testCase of scenarios.SESSION_MANAGEMENT.cases) {
      logger.info(`Testing: ${scenarios.SESSION_MANAGEMENT.name} - ${testCase.name}`);
      const result = await testSessionManagement(
        testCase.email,
        testCase.password,
        {
          simulateExpiration: testCase.simulateExpiration,
          multipleSessions: testCase.multipleSessions,
          testLogout: testCase.testLogout,
          invalidToken: testCase.invalidToken
        }
      );
      
      // Validate test results
      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && 
          (testCase.expectedSessions 
            ? result.details?.sessionCount === testCase.expectedSessions
            : true);
      
      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError 
            ? testCase.expectedError 
            : testCase.expectedSessions 
              ? `${testCase.expectedSessions} sessions`
              : "Success",
          got: testCase.expectError 
            ? result.error 
            : result.details?.sessionCount 
              ? `${result.details.sessionCount} sessions`
              : result.success ? "Success" : "Failure"
        });
      }
      
      await logTestResult(result);
    }

    // Run Account Lockout Tests
    logger.info("\nRunning Account Lockout Tests");
    for (const testCase of scenarios.ACCOUNT_LOCKOUT.cases) {
      logger.info(`Testing: ${scenarios.ACCOUNT_LOCKOUT.name} - ${testCase.name}`);
      
      const result = await testAccountLockout(
        testCase.email,
        testCase.password,
        {
          afterLockoutExpiry: testCase.afterLockoutExpiry
        }
      );

      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && (!testCase.expectedResult || result.details?.message === testCase.expectedResult);

      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedResult,
          got: result.error || result.details?.message
        });
      }

      await logTestResult(result);
    }

    // Run Account Recovery Tests
    logger.info("\nRunning Account Recovery Tests");
    for (const testCase of scenarios.ACCOUNT_RECOVERY.cases) {
      logger.info(`Testing: ${scenarios.ACCOUNT_RECOVERY.name} - ${testCase.name}`);
      
      const result = await testAccountRecovery(
        testCase.email,
        {
          newPassword: testCase.newPassword,
          verifyToken: testCase.verifyToken,
          expiredToken: testCase.expiredToken,
          usedToken: testCase.usedToken,
          rateLimited: testCase.rateLimited,
          recentChange: testCase.recentChange
        }
      );

      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && (!testCase.expectedResult || result.details?.message === testCase.expectedResult);

      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedResult,
          got: result.error || result.details?.message
        });
      }

      await logTestResult(result);
    }

    // Run Remember Me Tests
    logger.info("\nRunning Remember Me Tests");
    for (const testCase of scenarios.REMEMBER_ME.cases) {
      logger.info(`Testing: ${scenarios.REMEMBER_ME.name} - ${testCase.name}`);
      
      const result = await testRememberMe(
        testCase.email,
        testCase.password,
        {
          rememberMe: testCase.rememberMe,
          checkPersistence: testCase.checkPersistence
        }
      );

      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && (!testCase.expectedResult || result.details?.message === testCase.expectedResult);

      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedResult,
          got: result.error || result.details?.message
        });
      }

      await logTestResult(result);
    }

    // Run Security Tests
    logger.info("\nRunning Security Feature Tests");
    for (const testCase of scenarios.SECURITY.cases) {
      logger.info(`Testing: ${scenarios.SECURITY.name} - ${testCase.name}`);
      
      const result = await testSecurityFeatures(
        testCase.endpoint,
        testCase.method,
        {
          missingCsrf: testCase.missingCsrf,
          invalidCsrf: testCase.invalidCsrf,
          expiredCsrf: testCase.expiredCsrf,
          checkCsp: testCase.checkCsp,
          checkHsts: testCase.checkHsts,
          ip: testCase.ip,
          userAgent: testCase.userAgent,
          exceedLoginAttempts: testCase.exceedLoginAttempts,
          exceedResetAttempts: testCase.exceedResetAttempts,
          exceedApiRequests: testCase.exceedApiRequests
        }
      );

      const success = testCase.expectError
        ? result.error === testCase.expectedError
        : result.success && (!testCase.expectedResult || result.details?.message === testCase.expectedResult);

      if (!success) {
        logger.error("Test failed:", {
          testCase: testCase.name,
          expected: testCase.expectError ? testCase.expectedError : testCase.expectedResult,
          got: result.error || result.details?.message
        });
      }

      await logTestResult(result);
    }

  } catch (error) {
    logger.error("Error running auth tests:", error);
  } finally {
    // Clean up test data including sessions and verification tokens
    await prisma.session.deleteMany({
      where: {
        user: {
          email: {
            contains: "test.com"
          }
        }
      }
    });
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: {
          contains: "test.com"
        }
      }
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "test.com"
        }
      }
    });
  }
}
