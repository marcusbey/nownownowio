import { PrismaClient } from '@prisma/client'
import { env } from '../env'
import { checkNetworkConnectivity } from './network-checker'

// Ensure this code only runs on the server
if (typeof window !== 'undefined') {
  throw new Error('PrismaClient is only meant to be used on the server side.')
}

declare global {
  var prisma: PrismaClient | undefined
}

const MAX_RETRIES = 3
const RETRY_DELAY = 5000 // 5 seconds
const CONNECTION_TIMEOUT = 30000 // 30 seconds

async function getConnectionUrl(): Promise<string> {
  const networkStatus = await checkNetworkConnectivity()
  
  if (networkStatus.isRestricted) {
    console.warn('Network restrictions detected:', networkStatus.error)
    console.warn('Attempting to use connection pooling and SSL tunneling...')
    
    // Parse the existing URL
    const url = new URL(env.DATABASE_URL)
    
    // Add connection pooling and SSL parameters for restricted networks
    const params = new URLSearchParams({
      ...Object.fromEntries(url.searchParams),
      'pool_timeout': '30',
      'connection_limit': '5', // Reduce connection limit for restricted networks
      'sslmode': 'require',
      'connect_timeout': '30',
      'application_name': 'nownownow_restricted_network',
    })
    
    url.search = params.toString()
    return url.toString()
  }
  
  return env.DATABASE_URL
}

async function connectWithRetry(client: PrismaClient, retries = MAX_RETRIES): Promise<void> {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), CONNECTION_TIMEOUT)
    })

    await Promise.race([
      client.$connect(),
      timeoutPromise
    ])

    console.log('Successfully connected to database')
  } catch (error) {
    console.error(`Failed to connect to database (attempts remaining: ${retries}):`, error)
    
    if (retries > 0) {
      // Check network status on retry
      const networkStatus = await checkNetworkConnectivity()
      if (networkStatus.isRestricted) {
        console.warn('Network restrictions detected. Using alternative connection method...')
      }
      
      console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return connectWithRetry(client, retries - 1)
    }
    
    throw error
  }
}

let isConnecting = false
let connectionPromise: Promise<void> | null = null

const prismaClientSingleton = async () => {
  // Get the appropriate connection URL based on network conditions
  const connectionUrl = await getConnectionUrl()
  
  const client = new PrismaClient({
    log: [
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
      { level: 'info', emit: 'stdout' },
    ],
    datasources: {
      db: {
        url: connectionUrl
      }
    }
  })

  if (!isConnecting) {
    isConnecting = true
    connectionPromise = connectWithRetry(client)
      .catch((error) => {
        console.error('All connection attempts failed:', error)
        console.error('Database URL:', connectionUrl.replace(/:[^:@]+@/, ':****@'))
        console.error('Please check:')
        console.error('1. Database service status on Render.com')
        console.error('2. Network connectivity and firewall rules')
        console.error('3. Database credentials and URL format')
        console.error('4. If using restricted network (e.g., university WiFi):')
        console.error('   - Try using a VPN')
        console.error('   - Contact network administrator for PostgreSQL access')
        console.error('   - Consider using a different network')
        process.exit(1)
      })
      .finally(() => {
        isConnecting = false
      })
  }

  return client
}

// Initialize client with async connection handling
let prisma: PrismaClient

const initializePrisma = async () => {
  if (!global.prisma) {
    global.prisma = await prismaClientSingleton()
  }
  prisma = global.prisma
}

// Initialize immediately
initializePrisma().catch(console.error)

// Handle graceful shutdown
const shutdown = async () => {
  console.log('Shutting down Prisma client...')
  try {
    if (connectionPromise) {
      await connectionPromise
    }
    await prisma.$disconnect()
    console.log('Successfully disconnected Prisma client')
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error)
    process.exit(1)
  }
}

process.on('beforeExit', shutdown)
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

if (process.env.NODE_ENV === 'development') {
  process.on('SIGUSR2', async () => {
    await shutdown()
    process.kill(process.pid, 'SIGUSR2')
  })
}

export { prisma }
