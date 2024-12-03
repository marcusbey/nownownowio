import { RateLimiter } from 'limiter'

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  maxQueriesPerMinute?: number // Maximum number of queries per minute
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

interface QueryOptions {
  bypassCache?: boolean
  forceFresh?: boolean
  ttl?: number
}

// Simple rate limiter implementation
class SimpleRateLimiter {
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

class QueryCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private maxSize: number
  private defaultTTL: number
  private rateLimiter: SimpleRateLimiter
  
  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 500
    this.defaultTTL = options.ttl || 5 * 60 * 1000 // 5 minutes default TTL
    
    // Rate limit to 100 queries per minute by default
    const maxQueriesPerMinute = options.maxQueriesPerMinute || 100
    this.rateLimiter = new SimpleRateLimiter(maxQueriesPerMinute, 60 * 1000)
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key)
      }
    }
    
    // Remove oldest entries if cache is too large
    if (this.cache.size > this.maxSize) {
      const entriesToRemove = this.cache.size - this.maxSize
      const entries = Array.from(this.cache.entries())
      entries
        .sort((a, b) => a[1].expiresAt - b[1].expiresAt)
        .slice(0, entriesToRemove)
        .forEach(([key]) => this.cache.delete(key))
    }
  }
  
  async query<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    // Check rate limit
    if (!(await this.rateLimiter.removeToken())) {
      throw new Error('Rate limit exceeded for queries')
    }
    
    // Clean up expired entries
    this.cleanup()
    
    // Check cache unless bypass is requested
    if (!options.bypassCache) {
      const cached = this.cache.get(key)
      if (cached && cached.expiresAt > Date.now() && !options.forceFresh) {
        return cached.value
      }
    }
    
    // Execute query
    const value = await queryFn()
    
    // Cache result
    const ttl = options.ttl || this.defaultTTL
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
    
    return value
  }
  
  async batchQuery<T>(
    keys: string[],
    queryFn: () => Promise<T[]>,
    options: QueryOptions = {}
  ): Promise<T[]> {
    // Check rate limit
    if (!(await this.rateLimiter.removeToken())) {
      throw new Error('Rate limit exceeded for batch queries')
    }
    
    // Clean up expired entries
    this.cleanup()
    
    // Check cache for all keys
    if (!options.bypassCache) {
      const allCached = keys.every(key => {
        const cached = this.cache.get(key)
        return cached && cached.expiresAt > Date.now() && !options.forceFresh
      })
      
      if (allCached) {
        return keys.map(key => this.cache.get(key)!.value)
      }
    }
    
    // Execute batch query
    const values = await queryFn()
    
    // Cache results
    const ttl = options.ttl || this.defaultTTL
    keys.forEach((key, index) => {
      this.cache.set(key, {
        value: values[index],
        expiresAt: Date.now() + ttl,
      })
    })
    
    return values
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && entry.expiresAt > Date.now()
  }
  
  set(key: string, value: any, options: QueryOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
    })
    this.cleanup()
  }
  
  invalidate(key: string): void {
    this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
}

// Create singleton instance
export const queryCache = new QueryCache()
