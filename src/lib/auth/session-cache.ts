import { Session, DefaultSession } from 'next-auth'
import { cache } from 'react'
import { LRUCache } from 'lru-cache'

export interface CachedSession extends DefaultSession {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    displayName?: string | null;
    bio?: string | null;
  }
}

const sessionCache = new LRUCache<string, CachedSession>({
  max: 500,
  ttl: 1000 * 60 * 5, // Cache for 5 minutes
})

export const getCachedSession = cache(async (userId: string): Promise<CachedSession | null> => {
  const cachedSession = sessionCache.get(userId)
  return cachedSession || null
})

export const setCachedSession = (userId: string, session: Session) => {
  if (!session?.user) return

  const cachedSession: CachedSession = {
    ...session,
    user: {
      id: userId,
      email: session.user.email!,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      displayName: (session.user as any).displayName ?? null,
      bio: (session.user as any).bio ?? null
    }
  }
  sessionCache.set(userId, cachedSession)
}

export const invalidateSessionCache = (userId: string) => {
  sessionCache.delete(userId)
}
