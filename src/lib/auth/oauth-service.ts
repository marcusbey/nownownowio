import { prisma } from '../prisma'
import { queryCache } from '../cache/query-cache'
import { logger } from '../logger'
import { oAuthOptimizations } from './oauth-optimizations'
import { ProviderRefresh } from './provider-refresh'
import { authMonitoring } from './auth-monitoring'
import type { Account, User } from '@prisma/client'

export class OAuthService {
  // Get OAuth account with caching and rate limiting
  async getOAuthAccount(userId: string, provider: string): Promise<Account | null> {
    const cacheKey = `oauth:account:${userId}:${provider}`
    
    return queryCache.query(cacheKey, async () => {
      return prisma.account.findFirst({
        where: {
          userId,
          provider,
        },
        select: {
          id: true,
          access_token: true,
          expires_at: true,
          refresh_token: true,
          scope: true,
        },
      })
    }, { ttl: 5 * 60 * 1000 }) // 5 minute cache
  }

  // Batch load OAuth accounts for multiple users
  async getOAuthAccountsForUsers(userIds: string[], provider: string): Promise<Account[]> {
    const cacheKeys = userIds.map(id => `oauth:account:${id}:${provider}`)
    
    return queryCache.batchQuery(cacheKeys, async () => {
      return prisma.account.findMany({
        where: {
          userId: { in: userIds },
          provider,
        },
        select: {
          id: true,
          userId: true,
          access_token: true,
          expires_at: true,
          refresh_token: true,
          scope: true,
        },
      })
    })
  }

  // Link OAuth account with optimistic updates
  async linkOAuthAccount(userId: string, accountData: Partial<Account>): Promise<Account> {
    const cacheKey = `oauth:account:${userId}:${accountData.provider}`
    
    try {
      const account = await prisma.account.create({
        data: {
          ...accountData,
          userId,
        },
      })
      
      // Update cache optimistically
      queryCache.invalidate(cacheKey)
      
      return account
    } catch (error) {
      logger.error('Failed to link OAuth account', { userId, provider: accountData.provider, error })
      throw error
    }
  }

  // Refresh OAuth tokens with provider-specific logic
  async refreshOAuthTokens(userId: string, provider: string): Promise<Account> {
    return oAuthOptimizations.refreshToken(userId, provider, async () => {
      const account = await prisma.account.findFirst({
        where: { userId, provider },
      })

      if (!account?.refresh_token) {
        throw new Error('No refresh token available')
      }

      // Get provider-specific refresh function
      const refreshFn = ProviderRefresh.getRefreshFunction(provider)

      // Refresh tokens with monitoring
      const start = Date.now()
      try {
        const refreshedAccount = await oAuthOptimizations.callProvider(async () => {
          return refreshFn(account)
        })

        authMonitoring.recordMetric({
          provider,
          operation: 'call',
          duration: Date.now() - start,
          success: true,
        })

        return refreshedAccount
      } catch (error) {
        authMonitoring.recordMetric({
          provider,
          operation: 'call',
          duration: Date.now() - start,
          success: false,
          errorType: error.message,
        })
        throw error
      }
    })
  }

  // Clean up expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    const now = Math.floor(Date.now() / 1000)
    
    try {
      await prisma.account.deleteMany({
        where: {
          expires_at: {
            lt: now,
          },
          refresh_token: null,
        },
      })
      
      // Invalidate all OAuth account caches
      queryCache.invalidatePattern(/^oauth:account:/)
    } catch (error) {
      logger.error('Failed to cleanup expired tokens', { error })
      throw error
    }
  }
}

export const oAuthService = new OAuthService()
