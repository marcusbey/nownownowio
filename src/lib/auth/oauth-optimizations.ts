import { CompressionUtil } from '../utils/compression'
import { queryCache } from '../cache/query-cache'
import { logger } from '../logger'
import type { Account } from '@prisma/client'

// Simple rate limiter implementation
class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillRate: number // tokens per millisecond

  constructor(maxTokens: number, refillTimeMs: number) {
    this.maxTokens = maxTokens
    this.tokens = maxTokens
    this.lastRefill = Date.now()
    this.refillRate = maxTokens / refillTimeMs
  }

  async removeToken(): Promise<boolean> {
    this.refillTokens()
    if (this.tokens < 1) return false
    
    this.tokens -= 1
    return true
  }

  private refillTokens() {
    const now = Date.now()
    const timePassed = now - this.lastRefill
    const tokensToAdd = Math.floor(timePassed * this.refillRate)
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }
}

// Circuit breaker implementation
class CircuitBreaker {
  private failures: number = 0
  private lastFailure: number = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  
  constructor(
    private readonly failureThreshold: number = 5,
    private readonly resetTimeoutMs: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > this.resetTimeoutMs) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }

    try {
      const result = await fn()
      if (this.state === 'half-open') {
        this.state = 'closed'
        this.failures = 0
      }
      return result
    } catch (error) {
      this.failures++
      this.lastFailure = Date.now()
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'open'
      }
      throw error
    }
  }
}

// Token refresh queue to prevent stampedes
class TokenRefreshQueue {
  private queue: Map<string, Promise<Account>> = new Map()
  
  async enqueue(key: string, refreshFn: () => Promise<Account>): Promise<Account> {
    if (this.queue.has(key)) {
      return this.queue.get(key)!
    }
    
    const promise = refreshFn().finally(() => {
      this.queue.delete(key)
    })
    
    this.queue.set(key, promise)
    return promise
  }
}

// Rate limiters for different operations
const rateLimiters = {
  tokenRefresh: new RateLimiter(10, 60 * 1000), // 10 tokens per minute
  providerCalls: new RateLimiter(100, 60 * 1000), // 100 tokens per minute
}

// Circuit breaker for external calls
const circuitBreaker = new CircuitBreaker()

// Adaptive TTL calculation based on token expiration
function calculateTokenTTL(expiresAt: number | null): number {
  if (!expiresAt) return 5 * 60 * 1000 // 5 min default
  
  const now = Math.floor(Date.now() / 1000)
  const timeToExpiry = expiresAt - now
  return Math.min(timeToExpiry * 0.8, 24 * 60 * 60) * 1000 // 80% of time to expiry, max 24h
}

// Enhanced OAuth optimizations
export class OAuthOptimizations {
  private refreshQueue = new TokenRefreshQueue()
  
  // Rate limited token refresh
  async refreshToken(userId: string, provider: string, refreshFn: () => Promise<Account>): Promise<Account> {
    if (!(await rateLimiters.tokenRefresh.removeToken())) {
      throw new Error('Rate limit exceeded for token refresh')
    }
    
    const key = `${userId}:${provider}`
    return this.refreshQueue.enqueue(key, async () => {
      const account = await circuitBreaker.execute(refreshFn)
      
      // Compress token data if needed
      const compressedAccount = await CompressionUtil.compressIfNeeded(account)
      
      // Cache with adaptive TTL
      const ttl = calculateTokenTTL(account.expires_at)
      queryCache.set(`oauth:account:${userId}:${provider}`, compressedAccount, { ttl })
      
      return account
    })
  }
  
  // Rate limited provider API calls
  async callProvider<T>(fn: () => Promise<T>): Promise<T> {
    if (!(await rateLimiters.providerCalls.removeToken())) {
      throw new Error('Rate limit exceeded for provider calls')
    }
    return circuitBreaker.execute(fn)
  }
  
  // Cache warming for frequently accessed tokens
  async warmCache(userId: string, provider: string): Promise<void> {
    const key = `oauth:account:${userId}:${provider}`
    if (!queryCache.has(key)) {
      await this.refreshToken(userId, provider, async () => {
        // Implement provider-specific refresh logic
        throw new Error('Not implemented')
      })
    }
  }
}

export const oAuthOptimizations = new OAuthOptimizations()
