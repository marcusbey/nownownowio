// app/api/v1/hello/route.ts
import { createZodRoute } from "next-zod-route";
import { NextResponse } from "next/server";
import { auth, AuthError } from "./auth/helper";
import { getRequiredCurrentOrgFromUrl } from "./organizations/get-org";

export class RouteError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export const route = createZodRoute({
  handleServerError: (e: Error) => {
    if (e instanceof RouteError) {
      return NextResponse.json(
        { message: e.message, status: e.status },
        {
          status: e.status,
        },
      );
    }

    if (e instanceof AuthError) {
      return NextResponse.json(
        {
          message: e.message,
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json({ message: e.message }, { status: 500 });
  },
});

export const authRoute = route.use(async () => {
  const user = await auth();

  if (!user) {
    throw new RouteError("Session not found!");
  }

  return {
    user,
  };
});

// Can only be used in /api/v1/organizations/[organizationId]/* routes !
export const orgRoute = authRoute.use(async (context) => {
  // The context object contains the request object from Next.js
  const { request } = context;
  
  try {
    // Extract the URL from the request object
    const url = request.url || '';
    const organization = await getRequiredCurrentOrgFromUrl(url);

    return {
      organization,
    };
  } catch {
    // We don't need the error parameter here
    throw new RouteError(
      "You need to be part of an organization to access this resource.",
    );
  }
});
