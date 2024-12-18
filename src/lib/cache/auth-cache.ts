import { prisma } from '../prisma'
import { queryCache } from './query-cache'
import { CompressionUtil } from '../utils/compression'
import { logger } from '../logger'
import type { User, Account, Session } from '@prisma/client'

// Optimized user queries with compression
export async function getUserById(id: string) {
  const cacheKey = `user:${id}`
  
  return queryCache.query(cacheKey, async () => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        // Only include necessary fields
      }
    })

    if (!user) return null

    const result = await CompressionUtil.compressIfNeeded(user)
    return result
  })
}

// Batch load users with compression
export async function getUsersByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids)]
  const cacheKeys = uniqueIds.map(id => `user:${id}`)
  
  return queryCache.batchQuery(cacheKeys, async () => {
    const users = await prisma.user.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
      }
    })

    const compressedUsers = await Promise.all(
      users.map(user => CompressionUtil.compressIfNeeded(user))
    )
    return compressedUsers
  })
}

// Optimized session management with LRU cache
export async function getSession(sessionToken: string) {
  const cacheKey = `session:${sessionToken}`
  
  return queryCache.query(cacheKey, async () => {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
          }
        }
      }
    })

    if (!session) return null
    return session
  }, {
    ttl: 60 * 60 * 1000, // Cache for 1 hour
    staleWhileRevalidate: true
  })
}

// Optimized account queries
export async function getAccountByProvider(userId: string, provider: string) {
  const cacheKey = `account:${userId}:${provider}`
  
  return queryCache.query(cacheKey, async () => {
    const account = await prisma.account.findFirst({
      where: { 
        userId,
        provider,
      },
      select: {
        id: true,
        type: true,
        provider: true,
        providerAccountId: true,
        access_token: true,
        expires_at: true,
        refresh_token: true,
        scope: true,
      }
    })

    if (!account) return null

    const result = await CompressionUtil.compressIfNeeded(account)
    return result
  })
}

// Cleanup expired sessions
export async function cleanupExpiredSessions() {
  try {
    const now = new Date()
    await prisma.session.deleteMany({
      where: {
        expires: {
          lt: now
        }
      }
    })
    
    // Invalidate all session caches
    queryCache.invalidatePattern(/^session:/)
    
    logger.info('Cleaned up expired sessions')
  } catch (error) {
    logger.error('Failed to cleanup expired sessions', { error })
  }
}

// Setup periodic cleanup
setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000) // Run daily
