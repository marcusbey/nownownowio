import { Account } from '@prisma/client'
import { env } from '../env'
import { logger } from '../logger'
import { authMonitoring } from './auth-monitoring'

interface TokenResponse {
  access_token: string
  expires_in?: number
  refresh_token?: string
}

// Provider-specific refresh implementations
export class ProviderRefresh {
  static async refreshTwitterToken(account: Account): Promise<Account> {
    const start = Date.now()
    try {
      const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${env.TWITTER_ID}:${env.TWITTER_SECRET}`
          ).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: account.refresh_token!,
        }),
      })

      if (!response.ok) {
        throw new Error(`Twitter refresh failed: ${response.statusText}`)
      }

      const data = (await response.json()) as TokenResponse
      
      const updatedAccount = {
        ...account,
        access_token: data.access_token,
        expires_at: data.expires_in 
          ? Math.floor(Date.now() / 1000) + data.expires_in
          : account.expires_at,
        refresh_token: data.refresh_token ?? account.refresh_token,
      }

      authMonitoring.recordMetric({
        provider: 'twitter',
        operation: 'refresh',
        duration: Date.now() - start,
        success: true,
      })

      return updatedAccount
    } catch (error) {
      authMonitoring.recordMetric({
        provider: 'twitter',
        operation: 'refresh',
        duration: Date.now() - start,
        success: false,
        errorType: error.message,
      })
      throw error
    }
  }

  static async refreshGoogleToken(account: Account): Promise<Account> {
    const start = Date.now()
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: env.GOOGLE_ID!,
          client_secret: env.GOOGLE_SECRET!,
          grant_type: 'refresh_token',
          refresh_token: account.refresh_token!,
        }),
      })

      if (!response.ok) {
        throw new Error(`Google refresh failed: ${response.statusText}`)
      }

      const data = (await response.json()) as TokenResponse
      
      const updatedAccount = {
        ...account,
        access_token: data.access_token,
        expires_at: data.expires_in 
          ? Math.floor(Date.now() / 1000) + data.expires_in
          : account.expires_at,
        refresh_token: data.refresh_token ?? account.refresh_token,
      }

      authMonitoring.recordMetric({
        provider: 'google',
        operation: 'refresh',
        duration: Date.now() - start,
        success: true,
      })

      return updatedAccount
    } catch (error) {
      authMonitoring.recordMetric({
        provider: 'google',
        operation: 'refresh',
        duration: Date.now() - start,
        success: false,
        errorType: error.message,
      })
      throw error
    }
  }

  // Get refresh function for provider
  static getRefreshFunction(provider: string): (account: Account) => Promise<Account> {
    switch (provider) {
      case 'twitter':
        return this.refreshTwitterToken
      case 'google':
        return this.refreshGoogleToken
      default:
        throw new Error(`No refresh implementation for provider: ${provider}`)
    }
  }
}
