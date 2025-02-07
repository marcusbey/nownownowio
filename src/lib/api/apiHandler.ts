import { NextResponse } from "next/server";
import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { z } from "zod";

export type ApiResponse<T = any> = {
  data?: T;
  error?: string;
  status: number;
};

export type ApiHandler<T = any> = (params: {
  req: Request;
  user: { id: string; email: string };
  params?: Record<string, string>;
  searchParams?: URLSearchParams;
  body?: any;
}) => Promise<ApiResponse<T>>;

export type ApiMiddleware = (
  handler: ApiHandler
) => ApiHandler;

// Common error responses
export const ApiErrors = {
  Unauthorized: { error: "Unauthorized", status: 401 },
  NotFound: { error: "Not found", status: 404 },
  Forbidden: { error: "Forbidden", status: 403 },
  BadRequest: (message: string) => ({ error: message, status: 400 }),
  ServerError: (error: unknown) => ({
    error: "Internal server error",
    status: 500,
    details: process.env.NODE_ENV === "development" ? String(error) : undefined,
  }),
} as const;

// Middleware to validate request against a Zod schema
export const validateSchema = <T extends z.ZodType>(schema: T): ApiMiddleware => {
  return (handler: ApiHandler) => {
    return async (ctx) => {
      try {
        const validatedBody = schema.parse(ctx.body);
        return handler({ ...ctx, body: validatedBody });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            error: "Validation failed",
            details: error.errors,
            status: 400,
          };
        }
        return ApiErrors.ServerError(error);
      }
    };
  };
};

// Middleware to ensure user has required role
export const requireRole = (role: string): ApiMiddleware => {
  return (handler: ApiHandler) => {
    return async (ctx) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        include: { roles: true },
      });

      if (!user?.roles.some((r) => r.name === role)) {
        return ApiErrors.Forbidden;
      }

      return handler(ctx);
    };
  };
};

// Middleware to ensure user owns the resource
export const requireOwnership = (
  resourceType: string,
  idParam: string
): ApiMiddleware => {
  return (handler: ApiHandler) => {
    return async (ctx) => {
      const resourceId = ctx.params?.[idParam];
      if (!resourceId) {
        return ApiErrors.BadRequest(`Missing ${idParam} parameter`);
      }

      const resource = await prisma[resourceType].findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        return ApiErrors.NotFound;
      }

      if (resource.userId !== ctx.user.id) {
        return ApiErrors.Forbidden;
      }

      return handler(ctx);
    };
  };
};

// Main API handler wrapper
export const createApiHandler = (handler: ApiHandler, ...middleware: ApiMiddleware[]) => {
  return async (req: Request, routeContext: { params: Record<string, string> }) => {
    try {
      // Parse search params
      const url = new URL(req.url);
      const searchParams = url.searchParams;

      // Validate authentication
      const { user } = await validateRequest();
      if (!user) {
        return NextResponse.json(ApiErrors.Unauthorized, { status: 401 });
      }

      // Parse body if present
      let body;
      if (!["GET", "HEAD"].includes(req.method)) {
        try {
          body = await req.json();
        } catch {
          // Body is optional
        }
      }

      // Create handler context
      const ctx = {
        req,
        user,
        params: routeContext.params,
        searchParams,
        body,
      };

      // Apply middleware in order
      const handlerWithMiddleware = middleware.reduce(
        (h, m) => m(h),
        handler
      );

      // Execute handler
      const result = await handlerWithMiddleware(ctx);

      // Log errors in development
      if (result.status >= 400 && process.env.NODE_ENV === "development") {
        logger.error("API Error", {
          path: url.pathname,
          error: result.error,
          details: result.details,
        });
      }

      return NextResponse.json(
        { data: result.data, error: result.error },
        { status: result.status }
      );
    } catch (error) {
      logger.error("Unhandled API Error", {
        path: req.url,
        error: String(error),
      });
      return NextResponse.json(ApiErrors.ServerError(error), { status: 500 });
    }
  };
};
