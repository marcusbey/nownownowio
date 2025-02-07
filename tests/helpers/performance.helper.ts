import { performance } from 'perf_hooks';
import { logger } from '@/lib/logger';

export interface PerfMetric {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceHelper {
  private metrics: PerfMetric[] = [];
  private startTimes: Map<string, number> = new Map();

  start(operation: string) {
    this.startTimes.set(operation, performance.now());
  }

  end(operation: string, metadata?: Record<string, any>) {
    const startTime = this.startTimes.get(operation);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.push({
        operation,
        duration,
        timestamp: Date.now(),
        metadata,
      });
      this.startTimes.delete(operation);
      logger.info(`Performance: ${operation}`, {
        duration: `${duration.toFixed(2)}ms`,
        ...metadata,
      });
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getSummary() {
    const summary: Record<string, { count: number; totalDuration: number; avgDuration: number }> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.operation]) {
        summary[metric.operation] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      summary[metric.operation].count++;
      summary[metric.operation].totalDuration += metric.duration;
    }

    // Calculate averages
    for (const op in summary) {
      summary[op].avgDuration = summary[op].totalDuration / summary[op].count;
    }

    return summary;
  }

  reset() {
    this.metrics = [];
    this.startTimes.clear();
  }
}
