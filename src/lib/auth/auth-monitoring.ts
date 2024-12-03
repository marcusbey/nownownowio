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
  
  // Record auth operation metrics
  recordMetric(metric: AuthMetrics) {
    const metricWithTimestamp = {
      ...metric,
      timestamp: Date.now(),
    }
    
    this.metrics.push(metricWithTimestamp)
    
    // Log metric
    logger.info('Auth Operation Metric', metricWithTimestamp)
    
    // Clear old metrics (keep last 1000)
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
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
      m.operation === operation &&
      m.success
    )
    
    if (relevantMetrics.length === 0) return 0
    
    const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0)
    return totalDuration / relevantMetrics.length
  }
}

export const authMonitoring = new AuthMonitoring()
