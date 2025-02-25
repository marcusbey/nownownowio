
/**
 * Generates a token for widget authentication
 * @param userId User ID to include in the token
 * @returns Generated token string
 */
export function generateWidgetToken(userId: string): string {
    // Simple implementation - in production you'd use JWT or similar
    const timestamp = Date.now();
    const tokenParts = [userId, timestamp, 'widget-token'];

    // In a real app, you'd sign this with a secret key
    return Buffer.from(tokenParts.join('.')).toString('base64');
}

/**
 * Verifies a widget token against a user ID
 * @param token Token to verify
 * @param userId User ID to check against
 * @returns Boolean indicating if token is valid
 */
export function verifyWidgetToken(token: string, userId: string): boolean {
    try {
        // Decode the token
        const decoded = Buffer.from(token, 'base64').toString();
        const [tokenUserId] = decoded.split('.');

        // Check if user ID matches
        return tokenUserId === userId;
    } catch (error) {
        console.error('Error verifying widget token:', error);
        return false;
    }
} 