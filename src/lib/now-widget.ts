
/**
 * Generates a token for widget authentication
 * @param orgId Organization ID to include in the token
 * @returns Generated token string
 */
export function generateWidgetToken(orgId: string): string {
    // Simple implementation - in production you'd use JWT or similar
    const timestamp = Date.now();
    const tokenParts = [orgId, timestamp, 'widget-token'];

    // In a real app, you'd sign this with a secret key
    return Buffer.from(tokenParts.join('.')).toString('base64');
}

/**
 * Verifies a widget token against an organization ID
 * @param token Token to verify
 * @param orgId Organization ID to check against
 * @returns Boolean indicating if token is valid
 */
export function verifyWidgetToken(token: string, orgId: string): boolean {
    try {
        // Decode the token
        const decoded = Buffer.from(token, 'base64').toString();
        const [tokenOrgId] = decoded.split('.');

        // Check if organization ID matches
        return tokenOrgId === orgId;
    } catch {
        // Silently fail and return false for invalid tokens
        return false;
    }
} 