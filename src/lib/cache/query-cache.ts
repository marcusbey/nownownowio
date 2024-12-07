import { RateLimiter } from 'limiter'

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
  maxQueriesPerMinute?: number // Maximum number of queries per minute
  staleTime?: number // Time before data is considered stale
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
  lastAccessed: number
  staleAt: number
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

  async waitForToken(): Promise<void> {
    while (true) {
      this.refillTokens()
      if (this.tokens >= 1) {
        this.tokens -= 1
        return
      }
      await new Promise(resolve => globalThis.setTimeout(resolve, 100))
    }
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
  private defaultStaleTime: number
  private rateLimiter: SimpleRateLimiter
  
  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000
    this.defaultTTL = options.ttl || 15 * 60 * 1000
    this.defaultStaleTime = options.staleTime || 5 * 60 * 1000
    
    const maxQueriesPerMinute = options.maxQueriesPerMinute || 200
    this.rateLimiter = new SimpleRateLimiter(maxQueriesPerMinute, 60 * 1000)
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key)
      }
    }
    
    if (this.cache.size > this.maxSize) {
      const entriesToRemove = this.cache.size - this.maxSize
      const entries = Array.from(this.cache.entries())
      entries
        .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
        .slice(0, entriesToRemove)
        .forEach(([key]) => this.cache.delete(key))
    }
  }
  
  async query<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const cached = this.cache.get(key)
    const now = Date.now()

    if (cached && !options.bypassCache) {
      cached.lastAccessed = now
      
      if (now < cached.staleAt || !options.forceFresh) {
        return cached.value
      }
      
      if (now < cached.expiresAt) {
        this.refreshInBackground(key, queryFn, options)
        return cached.value
      }
    }

    await this.rateLimiter.waitForToken()

    const value = await queryFn()
    
    const ttl = options.ttl || this.defaultTTL
    this.set(key, value, { ttl })
    
    return value
  }

  private async refreshInBackground<T>(
    key: string,
    queryFn: () => Promise<T>,
    options: QueryOptions
  ) {
    try {
      const value = await queryFn()
      this.set(key, value, options)
    } catch (error) {
      globalThis.console.error('Background refresh failed:', error)
    }
  }
  
  async batchQuery<T>(
    keys: string[],
    queryFn: () => Promise<T[]>,
    options: QueryOptions = {}
  ): Promise<T[]> {
    await this.rateLimiter.waitForToken()

    const now = Date.now()
    const cachedKeys: string[] = []
    const missingKeys: string[] = []

    for (const key of keys) {
      const cached = this.cache.get(key)
      if (cached && !options.bypassCache) {
        cached.lastAccessed = now
        
        if (now < cached.staleAt || !options.forceFresh) {
          cachedKeys.push(key)
        } else if (now < cached.expiresAt) {
          cachedKeys.push(key)
          this.refreshInBackground(key, () => queryFn().then(values => values[keys.indexOf(key)]), options)
        } else {
          missingKeys.push(key)
        }
      } else {
        missingKeys.push(key)
      }
    }

    if (missingKeys.length === 0) {
      return cachedKeys.map(key => this.cache.get(key)!.value)
    }

    const values = await queryFn()
    
    const ttl = options.ttl || this.defaultTTL
    keys.forEach((key, index) => {
      this.set(key, values[index], { ttl })
    })
    
    return values
  }
  
  has(key: string): boolean {
    const entry = this.cache.get(key)
    return entry !== undefined && entry.expiresAt > Date.now()
  }
  
  set(key: string, value: any, options: QueryOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL
    const staleTime = options.staleTime || this.defaultStaleTime
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl,
      lastAccessed: Date.now(),
      staleAt: Date.now() + staleTime,
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
