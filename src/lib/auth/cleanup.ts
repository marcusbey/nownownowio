/**
 * Session cleanup utilities
 * These functions help with clearing cookies and storage to resolve orphaned session issues
 */

import { signOut } from "next-auth/react";

/**
 * Completely clears all auth-related cookies and storage
 * Use this function when you need to completely reset the auth state
 * 
 * @param callbackUrl The URL to redirect to after signing out
 */
export function cleanupSession(callbackUrl = "/auth/signin"): void {
    try {
        console.info("Running full session cleanup...");

        // Clear cookies using multiple approaches for thoroughness
        clearAllCookies();

        // Clear storage
        clearAllStorage();

        // Try to use NextAuth's signOut to clean up server-side session
        try {
            console.info("Calling NextAuth signOut...");
            void signOut({
                redirect: true,
                callbackUrl,
            });
        } catch (signOutError) {
            console.error("Error calling signOut:", signOutError);
            forceRedirect(callbackUrl);
        }
    } catch (error) {
        console.error("Error during session cleanup:", error);
        forceRedirect(callbackUrl);
    }
}

/**
 * Clear all cookies by using multiple approaches
 * This ensures we get cookies with different paths/domains
 */
function clearAllCookies(): void {
    try {
        // Get all cookie names
        const cookieNames = document.cookie.split(';').map(cookie =>
            cookie.split('=')[0].trim()
        );

        // Target auth-related cookies specifically
        const authCookies = cookieNames.filter(name =>
            name.includes('next-auth') ||
            name.includes('__Secure') ||
            name.includes('__Host') ||
            name.includes('session')
        );

        console.info(`Found ${cookieNames.length} cookies, ${authCookies.length} auth-related`);

        // Clear all cookies with various paths to ensure complete removal
        const paths = ['/', '/api', '/api/v1', '/api/v1/auth', '/auth', '/orgs'];
        const domains = [
            window.location.hostname,
            `.${window.location.hostname}`,
            window.location.hostname.split('.').slice(1).join('.'),
            `.${window.location.hostname.split('.').slice(1).join('.')}`,
        ];

        // Try every combination of path and domain for thoroughness
        [...authCookies, ...cookieNames].forEach(name => {
            // Basic deletion
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

            // Path-specific deletions
            paths.forEach(path => {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;

                // Domain-specific deletions
                domains.forEach(domain => {
                    if (domain.includes('.')) { // Only use valid domains
                        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
                    }
                });
            });
        });

        console.info("Cookie cleanup completed");
    } catch (e) {
        console.error("Error clearing cookies:", e);
    }
}

/**
 * Clear all browser storage that might contain auth data
 */
function clearAllStorage(): void {
    // Clear localStorage
    try {
        // First try targeted removal of auth items
        const authItems = ['next-auth', 'session', 'token'];
        authItems.forEach(item => {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes(item)) {
                    localStorage.removeItem(key);
                }
            }
        });

        // Then clear everything
        localStorage.clear();
        console.info("localStorage cleared");
    } catch (e) {
        console.error("Failed to clear localStorage:", e);
    }

    // Clear sessionStorage
    try {
        sessionStorage.clear();
        console.info("sessionStorage cleared");
    } catch (e) {
        console.error("Failed to clear sessionStorage:", e);
    }

    // Clear IndexedDB next-auth stores if they exist
    try {
        // Try to delete known NextAuth IndexedDB databases
        const dbNames = ['next-auth', 'next-auth.session-store', 'next-auth.message-store'];
        dbNames.forEach(dbName => {
            try {
                const req = indexedDB.deleteDatabase(dbName);
                req.onsuccess = () => console.info(`IndexedDB ${dbName} deleted`);
                req.onerror = () => console.error(`Failed to delete IndexedDB ${dbName}`);
            } catch (e) {
                console.error(`Error deleting IndexedDB ${dbName}:`, e);
            }
        });
    } catch (e) {
        console.error("Failed to clear IndexedDB:", e);
    }
}

/**
 * Force a page redirect as a last resort
 */
function forceRedirect(url: string): void {
    console.info(`Force redirecting to ${url}...`);
    window.location.href = url;
} 