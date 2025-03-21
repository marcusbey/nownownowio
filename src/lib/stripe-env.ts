"use server";

import { logger } from './logger';

/**
 * Gets a specific Stripe environment variable
 * This version is compatible with Edge Runtime and doesn't use fs
 */
export async function getStripeEnvVar(key: string): Promise<string | undefined> {
  // Check if it exists in process.env
  if (process.env[key]) {
    logger.info(`Using ${key} from process.env`);
    return process.env[key];
  }

  // Special handling for test keys
  if (key === 'STRIPE_SECRET_KEY_TEST' && process.env.STRIPE_SECRET_KEY) {
    logger.info('Using STRIPE_SECRET_KEY as fallback for STRIPE_SECRET_KEY_TEST');
    return process.env.STRIPE_SECRET_KEY;
  }

  logger.warn(`${key} not found in any environment variables`);
  return undefined;
}

/**
 * Loads environment variables from process.env
 * This version is compatible with Edge Runtime and doesn't use fs
 */
export async function loadStripeEnv(): Promise<Record<string, string>> {
  try {
    const envVars: Record<string, string> = {};

    // Filter environment variables that are related to Stripe
    for (const key in process.env) {
      if (key.includes('STRIPE')) {
        const value = process.env[key];
        if (value) {
          envVars[key] = value;
          logger.info(`Found Stripe environment variable: ${key}`);
        }
      }
    }

    // Log the number of variables loaded
    const stripeVarCount = Object.keys(envVars).length;
    logger.info(`Successfully loaded ${stripeVarCount} Stripe environment variables`);

    return envVars;
  } catch (error) {
    logger.error('Error loading Stripe environment variables', {
      error: error instanceof Error ? error.message : String(error)
    });
    return {};
  }
}
