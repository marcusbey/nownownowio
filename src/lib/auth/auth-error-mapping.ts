import { logger } from "@/lib/logger";

export type AuthErrorCode = 
  | "Default"
  | "Configuration"
  | "AccessDenied"
  | "Verification"
  | "TokenError"
  | "AccountLinking";

interface AuthError {
  code: AuthErrorCode;
  error: string;
  errorMessage: string;
}

export function getAuthError(error?: string | null): AuthError {
  if (!error) {
    return {
      code: "Default",
      error: "Configuration",
      errorMessage: "An unknown error occurred during authentication. Please try again or contact support."
    };
  }

  logger.error("[Auth] Processing auth error", { errorCode: error });

  switch (error) {
    case "Configuration":
      return {
        code: "Configuration",
        error: "Configuration",
        errorMessage: "There was an error with the authentication configuration. Please contact support."
      };
    case "AccessDenied":
      return {
        code: "AccessDenied",
        error: "AccessDenied",
        errorMessage: "Access was denied. Please try again or use a different sign-in method."
      };
    case "Verification":
      return {
        code: "Verification",
        error: "Verification",
        errorMessage: "Email verification is required. Please check your email and verify your account."
      };
    case "TokenError":
      return {
        code: "TokenError",
        error: "TokenError",
        errorMessage: "There was an error with your authentication token. Please try signing in again."
      };
    case "AccountLinking":
      return {
        code: "AccountLinking",
        error: "AccountLinking",
        errorMessage: "There was an error linking your accounts. Please try again or contact support."
      };
    default:
      logger.error("[Auth] Unhandled auth error", { rawErrorCode: error });
      return {
        code: "Default",
        error: "Configuration",
        errorMessage: "An unknown error occurred during authentication. Please try again or contact support."
      };
  }
}
