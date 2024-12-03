import { PrismaClient } from '@prisma/client'
import { env } from '../env'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: env.DATABASE_URL
      }
    }
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, model, args, query }) {
          const start = performance.now()
          const result = await query(args)
          const end = performance.now()
          
          // Log slow queries in production
          if (end - start > 500) { // Log queries taking more than 500ms
            console.warn(`Slow query detected:
              Model: ${model}
              Operation: ${operation}
              Duration: ${end - start}ms
            `)
          }
          
          return result
        },
      },
    },
  })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// Graceful shutdown
const shutdown = async () => {
  console.log('Shutting down Prisma client...')
  try {
    await prisma.$disconnect()
    console.log('Prisma client disconnected successfully')
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
process.on('beforeExit', shutdown)
