import { logger } from '../logger'

interface AuthMetrics {
  provider: string
  operation: 'refresh' | 'call' | 'error'
  duration: number
  success: boolean
  errorType?: string
  timestamp?: number
}

class AuthMonitoring {
  private metrics: AuthMetrics[] = []
  private lastLogTime: number = 0
  private readonly LOG_INTERVAL = 60000 // Log at most once per minute
  
  // Record auth operation metrics
  recordMetric(metric: AuthMetrics) {
    const now = Date.now()
    const metricWithTimestamp = {
      ...metric,
      timestamp: now,
    }
    
    this.metrics.push(metricWithTimestamp)
    
    // Only log if enough time has passed and there's an error
    if (!metric.success && now - this.lastLogTime >= this.LOG_INTERVAL) {
      logger.warn('Auth Operation Error', metricWithTimestamp)
      this.lastLogTime = now
    }
    
    // Keep only last 100 metrics instead of 1000
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }
  }
  
  // Get error rate for provider
  getErrorRate(provider: string, timeWindowMs = 5 * 60 * 1000): number {
    const now = Date.now()
    const relevantMetrics = this.metrics.filter(m => 
      m.provider === provider && 
      m.timestamp && 
      now - m.timestamp < timeWindowMs
    )
    
    if (relevantMetrics.length === 0) return 0
    
    const errors = relevantMetrics.filter(m => !m.success).length
    return errors / relevantMetrics.length
  }
  
  // Get average operation duration
  getAverageDuration(provider: string, operation: AuthMetrics['operation']): number {
    const relevantMetrics = this.metrics.filter(m => 
      m.provider === provider && 
      m.operation === operation
    )
    
    if (relevantMetrics.length === 0) return 0
    
    const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    return totalDuration / relevantMetrics.length
  }
}

export const authMonitoring = new AuthMonitoring()
