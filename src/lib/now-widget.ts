
import { logger } from '@/lib/logger';

/**
 * Type for widget settings
 */
export type WidgetSettings = {
  theme: string;
  position: string;
  buttonColor: string;
  buttonSize: number;
}

/**
 * Generates a token for widget authentication
 * @param orgId Organization ID to include in the token
 * @param websiteUrl Optional website URL to include in the token for domain validation
 * @returns Generated token string
 */
export function generateWidgetToken(orgId: string, websiteUrl?: string): string {
    if (!orgId) {
        throw new Error('Organization ID is required to generate widget token');
    }
    
    // Extract domain from website URL if provided
    let domain = '';
    if (websiteUrl) {
        try {
            domain = new URL(websiteUrl).hostname;
        } catch (error) {
            logger.warn('Invalid website URL provided for token generation', { websiteUrl, error });
            // Continue without domain if URL is invalid
        }
    }
    
    // Use a more secure implementation with timestamp, domain and a secret
    const timestamp = Date.now();
    const secret = process.env.WIDGET_TOKEN_SECRET ?? 'default-widget-secret';
    const tokenParts = [orgId, timestamp.toString(), domain, secret];

    // In a production app, you'd use a proper JWT library
    return Buffer.from(tokenParts.join('.')).toString('base64');
}

/**
 * Verifies a widget token against an organization ID and optionally a domain
 * @param token Token to verify
 * @param orgId Organization ID to check against
 * @param requestOrigin Optional request origin to validate against the token's domain
 * @returns Boolean indicating if token is valid
 */
export function verifyWidgetToken(token: string, orgId: string, requestOrigin?: string | null): boolean {
    if (!token || !orgId) {
        logger.warn('Widget authentication failed: Missing token or organization ID');
        return false;
    }
    
    try {
        // Decode the token
        const decoded = Buffer.from(token, 'base64').toString();
        const [tokenOrgId, timestampStr, tokenDomain] = decoded.split('.');
        
        // Check if organization ID matches
        if (tokenOrgId !== orgId) {
            logger.warn('Widget authentication failed: Organization ID mismatch', {
                expectedOrgId: orgId,
                receivedOrgId: tokenOrgId
            });
            return false;
        }
        
        // Optional: Check token age (e.g., expire after 30 days)
        const timestamp = parseInt(timestampStr, 10);
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        
        if (isNaN(timestamp) || now - timestamp > maxAge) {
            logger.warn('Widget authentication failed: Token expired', {
                tokenAge: now - timestamp,
                maxAge
            });
            return false;
        }
        
        // If request origin is provided and token has a domain, validate the origin
        if (requestOrigin && tokenDomain) {
            try {
                const originUrl = new URL(requestOrigin);
                const originDomain = originUrl.hostname.toLowerCase();
                const storedDomain = tokenDomain.toLowerCase();
                
                // Check if domains match or if origin is a subdomain of the allowed domain
                const isValidDomain = originDomain === storedDomain || 
                                     originDomain.endsWith(`.${storedDomain}`);
                
                if (!isValidDomain) {
                    logger.warn('Widget authentication failed: Domain mismatch', {
                        tokenDomain: storedDomain,
                        requestDomain: originDomain
                    });
                    return false;
                }
            } catch (error) {
                logger.error('Error validating request origin', { error, requestOrigin });
                return false;
            }
        }
        
        return true;
    } catch (error) {
        logger.error('Widget authentication error', { error });
        return false;
    }
}

/**
 * Validates if a request is coming from an allowed domain
 * @param requestOrigin The origin header from the request
 * @param allowedDomain The domain that is allowed to use the widget
 * @returns Boolean indicating if the request is from an allowed domain
 */
export function validateWidgetOrigin(requestOrigin: string | null, allowedDomain: string): boolean {
    if (!requestOrigin || !allowedDomain) {
        logger.warn('Widget origin validation failed: Missing origin or allowed domain');
        return false;
    }
    
    try {
        // Extract domain from origin
        const originUrl = new URL(requestOrigin);
        const originDomain = originUrl.hostname;
        
        // Check if domains match (case insensitive)
        const lowerOriginDomain = originDomain.toLowerCase();
        const lowerAllowedDomain = allowedDomain.toLowerCase();
        const isValid = lowerOriginDomain === lowerAllowedDomain || 
                      lowerOriginDomain.endsWith(`.${lowerAllowedDomain}`);
        
        if (!isValid) {
            logger.warn('Widget origin validation failed: Domain mismatch', {
                allowedDomain,
                requestOrigin: originDomain
            });
        }
        
        return isValid;
    } catch (error) {
        logger.error('Widget origin validation error', { error, requestOrigin });
        return false;
    }
}

/**
 * Gets CORS headers for widget API responses
 * @param allowedOrigin Optional specific origin to allow (if not provided, allows all origins)
 * @returns Object with CORS headers
 */
export function getWidgetCorsHeaders(allowedOrigin?: string): Record<string, string> {
    return {
        'Access-Control-Allow-Origin': allowedOrigin ?? '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // Cache preflight response for 1 day
    };
}