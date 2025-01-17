import { performance } from 'perf_hooks';
import { logger } from '../src/lib/logger';
import { prisma } from '../src/lib/prisma';

interface PerfMetric {
    operation: string;
    duration: number;
    timestamp: number;
    metadata?: Record<string, any>;
}

class PerformanceMonitor {
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
                metadata
            });
            this.startTimes.delete(operation);
            logger.info(`Performance: ${operation}`, {
                duration: `${duration.toFixed(2)}ms`,
                ...metadata
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

        for (const op in summary) {
            summary[op].avgDuration = summary[op].totalDuration / summary[op].count;
        }

        return summary;
    }
}

const monitor = new PerformanceMonitor();

// Wrap Prisma client with performance monitoring
const wrappedPrisma = new Proxy(prisma, {
    get(target, prop) {
        const original = target[prop as keyof typeof target];
        if (typeof original === 'function') {
            return async function (...args: any[]) {
                const operation = `prisma.${String(prop)}`;
                monitor.start(operation);
                try {
                    const result = await (original as Function).call(target, ...args);
                    monitor.end(operation, { args: JSON.stringify(args).slice(0, 100) });
                    return result;
                } catch (error) {
                    monitor.end(operation, { error: error instanceof Error ? error.message : String(error) });
                    throw error;
                }
            };
        }
        return original;
    }
});

// Performance testing functions
async function testDatabasePerformance() {
    monitor.start('db-operations');
    
    // Test user creation
    monitor.start('create-user');
    const user = await wrappedPrisma.user.create({
        data: {
            email: `test-${Date.now()}@example.com`,
            name: 'Test User'
        }
    });
    monitor.end('create-user');

    // Test user query with relations
    monitor.start('query-user-with-relations');
    await wrappedPrisma.user.findUnique({
        where: { id: user.id },
        include: {
            sessions: true,
            accounts: true,
            organizations: true,
            posts: true,
            comments: true,
            likes: true,
            bookmarks: true,
            following: true,
            followers: true,
            notifications: true
        }
    });
    monitor.end('query-user-with-relations');

    // Cleanup
    await wrappedPrisma.user.delete({ where: { id: user.id } });
    
    monitor.end('db-operations');
}

async function testAuthenticationPerformance() {
    monitor.start('auth-flow');
    
    // Test email verification
    monitor.start('email-verification');
    // Add your email verification test here
    monitor.end('email-verification');

    // Test OAuth flow
    monitor.start('oauth-flow');
    // Add your OAuth flow test here
    monitor.end('oauth-flow');

    monitor.end('auth-flow');
}

async function runPerformanceTests() {
    logger.info('Starting Performance Tests...');
    
    monitor.start('total-execution');
    
    await testDatabasePerformance();
    await testAuthenticationPerformance();
    
    monitor.end('total-execution');
    
    const summary = monitor.getSummary();
    logger.info('Performance Summary:', summary);
}

// Run performance tests
if (require.main === module) {
    runPerformanceTests()
        .catch(console.error)
        .finally(async () => {
            await prisma.$disconnect();
        });
}
