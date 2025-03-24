/**
 * Enhanced fetch utility with timeout, retry, and error handling
 * Provides robust error handling for network requests
 */

type FetchWithTimeoutOptions = {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
  method?: string;
  body?: BodyInit;
};

/**
 * Fetch with timeout, retry, and error handling
 * @param url URL to fetch
 * @param options Options for fetch
 * @returns Response data or null if error
 */
export async function fetchWithTimeout<T>(
  url: string,
  options: FetchWithTimeoutOptions = {}
): Promise<T | null> {
  const {
    timeout = 8000,
    retries = 2,
    retryDelay = 1000,
    credentials = "include",
    headers = {},
    method = "GET",
    body,
  } = options;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Merge headers with defaults
  const mergedHeaders = {
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    ...headers,
  };

  // Setup fetch options
  const fetchOptions: RequestInit = {
    method,
    credentials,
    headers: mergedHeaders,
    signal: controller.signal,
    ...(body ? { body } : {}),
  };

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const response = await fetch(url, fetchOptions);
      
      // Clear timeout
      clearTimeout(timeoutId);
      
      // Handle unauthorized or other error statuses
      if (response.status === 401) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on abort errors (timeouts)
      if (lastError.name === "AbortError") {
        break;
      }
      
      // Don't log during retries to avoid console spam
      if (attempt === retries) {
        // Use void operator to properly handle Promise
        void console.error(`Failed to fetch ${url}:`, lastError);
      }
      
      // Wait before retry
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      attempt++;
    }
  }
  
  return null;
}

/**
 * POST request with JSON body
 * @param url URL to fetch
 * @param data Data to send in request body
 * @param options Additional options
 * @returns Response data or null if error
 */
export async function postJSON<T, R = any>(
  url: string,
  data: R,
  options: Omit<FetchWithTimeoutOptions, "method" | "body"> = {}
): Promise<T | null> {
  return fetchWithTimeout<T>(url, {
    ...options,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: JSON.stringify(data),
  });
}
