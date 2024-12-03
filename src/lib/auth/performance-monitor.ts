import { logger } from '../logger'

interface PerformanceMetric {
  operation: string
  duration: number
  timestamp: number
  metadata?: Record<string, any>
}

class AuthPerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private slowThreshold = 500 // ms

  trackOperation = async <T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const start = performance.now()
    try {
      const result = await fn()
      const duration = performance.now() - start

      this.metrics.push({
        operation,
        duration,
        timestamp: Date.now(),
        metadata
      })

      if (duration > this.slowThreshold) {
        logger.warn('Slow auth operation detected', {
          operation,
          duration: `${duration.toFixed(2)}ms`,
          ...metadata
        })
      }

      return result
    } catch (error) {
      const duration = performance.now() - start
      logger.error('Auth operation failed', {
        operation,
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata
      })
      throw error
    }
  }

  getMetrics(options?: {
    operation?: string
    since?: number
    threshold?: number
  }) {
    let filtered = this.metrics

    if (options?.operation) {
      filtered = filtered.filter(m => m.operation === options.operation)
    }

    if (options?.since) {
      filtered = filtered.filter(m => m.timestamp >= options.since)
    }

    if (options?.threshold) {
      filtered = filtered.filter(m => m.duration >= options.threshold)
    }

    return filtered
  }

  getAverageLatency(operation?: string) {
    const relevant = operation
      ? this.metrics.filter(m => m.operation === operation)
      : this.metrics

    if (relevant.length === 0) return 0

    const total = relevant.reduce((sum, m) => sum + m.duration, 0)
    return total / relevant.length
  }

  clearMetrics() {
    this.metrics = []
  }
}

export const authPerformanceMonitor = new AuthPerformanceMonitor()
