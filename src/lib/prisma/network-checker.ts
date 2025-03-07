import { env } from '../env'

export interface NetworkStatus {
  isRestricted: boolean
  canConnectToDatabase: boolean
  error?: string
}

export async function checkNetworkConnectivity(): Promise<NetworkStatus> {
  const dbUrl = new URL(env.DATABASE_URL)
  const host = dbUrl.hostname
  const port = dbUrl.port || '5432'

  try {
    // First try a basic fetch to check internet connectivity
    await fetch('https://api.render.com/ping')

    // Now try to connect to database through a proxy check endpoint
    const response = await fetch(`https://api.render.com/v1/proxy-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host,
        port: parseInt(port),
      }),
    })

    if (!response.ok) {
      return {
        isRestricted: true,
        canConnectToDatabase: false,
        error: 'Network may be blocking PostgreSQL connections',
      }
    }

    return {
      isRestricted: false,
      canConnectToDatabase: true,
    }
  } catch (error) {
    return {
      isRestricted: true,
      canConnectToDatabase: false,
      error: error instanceof Error ? error.message : 'Unknown network error',
    }
  }
}
