"use server";

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

/**
 * Loads environment variables from .env.stripe file
 * This is necessary because Next.js doesn't automatically load variables from custom named env files
 */
export async function loadStripeEnv(): Promise<Record<string, string>> {
  try {
    // Get the project root directory
    const rootDir = process.cwd();
    const envPath = path.join(rootDir, '.env.stripe');
    
    // Check if the file exists
    if (!fs.existsSync(envPath)) {
      logger.warn('Stripe environment file (.env.stripe) not found');
      return {};
    }
    
    // Read and parse the .env.stripe file
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const envVars: Record<string, string> = {};
    
    // Parse each line to extract key-value pairs
    envContent.split('\n').forEach(line => {
      // Skip comments and empty lines
      if (!line || line.startsWith('#')) return;
      
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        
        // Trim any whitespace
        value = value.trim();
        
        // Store the variable
        envVars[key] = value;
        
        // For debugging - log the keys we've found (without showing the actual values)
        if (key.includes('STRIPE')) {
          logger.info(`Found Stripe environment variable: ${key}`);
        }
      }
    });
    
    // Log the number of variables loaded
    const stripeVarCount = Object.keys(envVars).filter(key => key.includes('STRIPE')).length;
    logger.info(`Successfully loaded ${stripeVarCount} Stripe environment variables`);
    
    return envVars;
  } catch (error) {
    logger.error('Error loading Stripe environment variables', { error });
    return {};
  }
}

/**
 * Gets a specific Stripe environment variable
 */
export async function getStripeEnvVar(key: string): Promise<string | undefined> {
  // First try to load from .env.stripe (prioritize this for Stripe keys)
  const stripeEnv = await loadStripeEnv();
  const stripeValue = stripeEnv[key];
  
  if (stripeValue) {
    logger.info(`Using ${key} from .env.stripe file`);
    return stripeValue;
  }
  
  // If not found in .env.stripe, check if it exists in process.env
  if (process.env[key]) {
    logger.info(`Using ${key} from process.env`);
    return process.env[key];
  }
  
  // Special handling for test keys
  if (key === 'STRIPE_SECRET_KEY_TEST' && stripeEnv['STRIPE_SECRET_KEY']) {
    logger.info('Using STRIPE_SECRET_KEY from .env.stripe as fallback for STRIPE_SECRET_KEY_TEST');
    return stripeEnv['STRIPE_SECRET_KEY'];
  }
  
  logger.warn(`${key} not found in any environment variables`);
  return undefined;
}
