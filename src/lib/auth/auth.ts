import config from "@/config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { getAccountByProvider, getUserById, getSession } from '../cache/auth-cache';
import { env } from "../env";
import { logger } from '../logger';
import { prisma } from "../prisma";
import {
  setupDefaultOrganizationsOrInviteUser,
  setupResendCustomer,
} from "./auth-config-setup";
import {
  credentialsOverrideJwt,
  credentialsSignInCallback,
} from "./credentials-provider";
import { getNextAuthConfigProviders } from "./getNextAuthConfigProviders";
import {
  getProviderConfig,
  isValidProvider,
  OAuthTokens
} from "./helper";

export const { handlers, auth: baseAuth } = NextAuth((req) => ({
  adapter: PrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/orgs",
  },
  session: {
    strategy: "database",
    maxAge: 365 * 24 * 60 * 60, // 1 year
    updateAge: 24 * 60 * 60, // Refresh daily instead of weekly
  },
  secret: env.NEXTAUTH_SECRET,
  trustHost: true,
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (process.env.NODE_ENV === "development") {
        return url.startsWith("/") ? `${baseUrl}${url}` : url;
      }
      return baseUrl;
    },
    async session(params) {
      if (params.newSession) return params.session;

      try {
        // Use cached session data
        const cachedSession = await getSession(params.session.sessionToken);
        if (cachedSession) {
          return {
            ...params.session,
            user: cachedSession.user
          };
        }

        // Fallback to database query if cache miss
        const user = await getUserById(params.session.user.id);
        if (!user) return null;

        return {
          ...params.session,
          user
        };
      } catch (error) {
        logger.error('Session callback error:', error);
        return params.session;
      }
    },
    async signIn({ user, account }) {
      if (!account || !user) {
        logger.error("[Auth] SignIn failed: Missing account or user data");
        return false;
      }

      // For Twitter, if email is not available, create a placeholder
      if (account.provider === "twitter" && !user.email) {
        user.email = `${user.id}@twitter.placeholder.com`;
        logger.info("[Auth] Created placeholder email for Twitter user", { 
          userId: user.id,
          email: user.email 
        });
      }

      if (!user.email) {
        logger.error("[Auth] SignIn failed: No email provided", { user });
        return false;
      }

      try {
        // First try to find a user with the same email
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { 
            accounts: true,
            organizations: {
              include: {
                organization: true
              }
            },
            posts: true
          }
        });

        // For OAuth providers, we can trust the email is verified
        if (account.type === "oauth") {
          user.emailVerified = new Date();
        }

        // If no existing user, we're good to proceed
        if (!existingUser) {
          return true;
        }

        // If no user found and this is a Twitter placeholder email,
        // try to find a matching user by name
        if (!existingUser && user.email?.includes('@twitter.placeholder.com')) {
          const normalizedNewName = user.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Find all users and check for name similarity
          const allUsers = await prisma.user.findMany({
            include: {
              accounts: true,
              organizations: {
                include: {
                  organization: true
                }
              },
              posts: true
            }
          });

          // Find a user with a similar name
          existingUser = allUsers.find(u => {
            const normalizedExistingName = u.name?.toLowerCase().replace(/[^a-z0-9]/g, '');
            return normalizedExistingName && normalizedNewName &&
                   (normalizedExistingName.includes(normalizedNewName) ||
                    normalizedNewName.includes(normalizedExistingName));
          });

          if (existingUser) {
            logger.info('[Auth] Found matching user by name similarity', {
              newUser: user.name,
              existingUser: existingUser.name
            });
          }
        }

        if (existingUser) {
          // Check if this provider is already linked
          const hasProvider = existingUser.accounts.some(
            acc => acc.provider === account.provider
          );

          if (!hasProvider) {
            // Link the new provider to the existing account
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type || "oauth",
                provider: account.provider,
                providerAccountId: account.providerAccountId || user.id,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state
              }
            });

            // If this was a Twitter placeholder email, update it with the real email
            if (existingUser.email?.includes('@twitter.placeholder.com') && !user.email?.includes('@twitter.placeholder.com')) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { email: user.email }
              });
              logger.info('[Auth] Updated Twitter placeholder email with real email', {
                oldEmail: existingUser.email,
                newEmail: user.email
              });
            }

            // Update user profile with merged data
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: existingUser.name || user.name,
                image: existingUser.image || user.image,
              }
            });

            logger.info(`[Auth] Linked ${account.provider} to existing account`, {
              email: user.email,
              provider: account.provider,
              userId: existingUser.id
            });
          }

          // Return true to allow sign in with the existing user
          return true;
        }

        // If no existing user, check for any user with the same email domain
        const emailDomain = user.email.split('@')[1];
        const userWithSameEmailDomain = await prisma.user.findFirst({
          where: { 
            email: {
              endsWith: `@${emailDomain}`
            }
          },
          include: {
            organizations: {
              include: {
                organization: true
              }
            },
            posts: true
          }
        });

        if (userWithSameEmailDomain?.organizations.length > 0) {
          // Get the organization of the existing user
          const existingOrg = userWithSameEmailDomain.organizations[0].organization;
          
          // Create new user and link to existing organization
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              organizations: {
                create: {
                  organizationId: existingOrg.id,
                  role: 'MEMBER'
                }
              }
            }
          });

          logger.info(`[Auth] Created new user and linked to existing organization`, {
            email: user.email,
            organizationId: existingOrg.id
          });

          return true;
        }

        // If no existing organization, create new user with new organization
        logger.info(`[Auth] Creating new user and organization for ${account.provider}`, { 
          email: user.email,
          provider: account.provider 
        });
        return true;
      } catch (error) {
        logger.error("[Auth] Error during sign in", {
          error,
          email: user.email,
          provider: account.provider
        });
        return false;
      }
    },
  },
  events: {
    signIn: credentialsSignInCallback(req),
    createUser: async (user) => {
      logger.info("[Auth] Creating new user", { user });

      try {
        // Check for existing user with same email
        const existingUser = await prisma.user.findFirst({
          where: { 
            email: user.email 
          },
          include: {
            organizations: {
              include: {
                organization: true
              }
            },
            posts: true
          }
        });

        if (existingUser) {
          // Merge the accounts by moving all posts to the existing user
          if (existingUser.posts.length > 0) {
            await prisma.post.updateMany({
              where: { authorId: existingUser.id },
              data: { authorId: user.id }
            });
          }

          // Use existing organization
          const existingOrg = existingUser.organizations[0].organization;
          
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              // Keep the name from the existing user if available
              name: existingUser.name || user.name,
              // Keep the image from the existing user if available
              image: existingUser.image || user.image,
              // Set emailVerified if it was set in signIn
              emailVerified: user.emailVerified,
              organizations: {
                create: {
                  organizationId: existingOrg.id,
                  role: 'MEMBER'
                }
              }
            }
          });

          logger.info("[Auth] Created new user in existing organization", {
            userId: newUser.id,
            organizationId: existingOrg.id
          });

          return newUser;
        }

        // Create new user with new organization
        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            image: user.image,
            // Set emailVerified if it was set in signIn
            emailVerified: user.emailVerified,
            organizations: {
              create: {
                organization: {
                  create: {
                    name: user.name ? `${user.name}'s Organization` : 'My Organization',
                    slug: generateSlug(),
                  }
                },
                role: 'OWNER'
              }
            }
          },
          include: {
            organizations: {
              include: {
                organization: true
              }
            }
          }
        });

        logger.info("[Auth] Created new user with new organization", {
          userId: newUser.id,
          organizationId: newUser.organizations[0].organizationId
        });

        return newUser;
      } catch (error) {
        logger.error("[Auth] Error creating user", { error, user });
        throw error;
      }
    },
  },
  jwt: credentialsOverrideJwt,
  debug: process.env.NODE_ENV === "development",
  theme: {
    logo: `https://${config.domainName}/logo.png`,
  },
}));

// Export auth config for use in API routes
export const authOptions = (req: Request) => ({
  adapter: PrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  callbacks: {
    redirect: async ({ url, baseUrl }) => {
      if (process.env.NODE_ENV === "development") {
        return Promise.resolve(url);
      }
      const urlObj = new URL(url, baseUrl);
      return urlObj.toString();
    },
    session: async (params) => {
      return params.session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
});

export async function handleOAuthSignIn(profile: {
  email: string;
  provider: string;
  providerAccountId: string;
}) {
  if (!isValidProvider(profile.provider)) {
    throw new Error(`Unsupported provider: ${profile.provider}`);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: profile.email },
    include: { accounts: true },
  });

  if (existingUser) {
    const existingProvider = existingUser.accounts.find(
      (account) => account.provider === profile.provider
    );

    if (existingProvider) {
      return {
        action: 'signin',
        user: existingUser,
        accounts: existingUser.accounts,
      };
    }

    const newAccount = await prisma.account.create({
      data: {
        userId: existingUser.id,
        type: 'oauth',
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
    });

    return {
      action: 'merge',
      user: existingUser,
      accounts: [...existingUser.accounts, newAccount],
    };
  }

  const newUser = await prisma.user.create({
    data: {
      email: profile.email,
      emailVerified: new Date(),
    },
  });

  const account = await prisma.account.create({
    data: {
      userId: newUser.id,
      type: 'oauth',
      provider: profile.provider,
      providerAccountId: profile.providerAccountId,
    },
  });

  return {
    action: 'create',
    user: newUser,
    accounts: [account],
  };
}

export async function handleOAuthTokenError({
  error,
  token,
  refreshToken,
}: {
  error: string;
  token: string;
  refreshToken: string;
}) {
  if (error === 'token_expired' && refreshToken) {
    try {
      const account = await prisma.account.findFirst({
        where: { refresh_token: refreshToken },
      });

      if (!account || !isValidProvider(account.provider)) {
        throw new Error('Invalid account or provider');
      }

      const config = getProviderConfig(account.provider);
      const response = await fetch(config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();
      const newTokens: OAuthTokens = {
        access_token: data.access_token,
        expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
        refresh_token: data.refresh_token,
      };

      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: newTokens.access_token,
          expires_at: newTokens.expires_at,
          refresh_token: newTokens.refresh_token ?? refreshToken,
        },
      });

      return {
        success: true,
        newToken: newTokens.access_token,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }
  }

  return {
    success: false,
    error: `Unhandled OAuth error: ${error}`,
  };
}

export async function linkProvider({
  userId,
  provider,
  providerAccountId,
}: {
  userId: string;
  provider: string;
  providerAccountId: string;
}) {
  if (!isValidProvider(provider)) {
    return {
      error: 'unsupported_provider',
    };
  }

  const existingAccount = await prisma.account.findFirst({
    where: {
      userId,
      provider,
    },
  });

  if (existingAccount) {
    return {
      error: 'provider_already_linked',
      account: existingAccount,
    };
  }

  const account = await prisma.account.create({
    data: {
      userId,
      type: 'oauth',
      provider,
      providerAccountId,
    },
  });

  return { account };
}
