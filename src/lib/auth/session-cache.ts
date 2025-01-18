import { Session, DefaultSession } from 'next-auth'
import { cache } from 'react'
import { LRUCache } from 'lru-cache'

export interface CachedSession extends DefaultSession {
  sessionToken?: string
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
    displayName?: string | null
    bio?: string | null
  }
}

const sessionCache = new LRUCache<string, CachedSession>({
  max: 500, // Maximum number of sessions to cache
  ttl: 1000 * 60 * 5, // Cache for 5 minutes
})

export const getCachedSession = cache(async (token: string): Promise<CachedSession | null> => {
  const cachedSession = sessionCache.get(token)
  if (cachedSession) {
    return cachedSession
  }
  return null
})

export const setCachedSession = (token: string, session: DefaultSession & { user: { id: string } }) => {
  const cachedSession: CachedSession = {
    ...session,
    sessionToken: token,
    user: {
      ...session.user,
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      displayName: null,
      bio: null
    }
  }
  sessionCache.set(token, cachedSession)
}

export const invalidateSessionCache = (token: string) => {
  sessionCache.delete(token)
}
