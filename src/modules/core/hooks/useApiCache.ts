import { useCallback, useRef } from 'react';

interface CacheConfig {
  ttl: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function useApiCache<T>(config: CacheConfig = { ttl: 5 * 60 * 1000 }) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > config.ttl;
    if (isExpired) {
      cache.current.delete(key);
      return null;
    }

    return entry.data;
  }, [config.ttl]);

  const set = useCallback((key: string, data: T) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const clear = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  return {
    get,
    set,
    clear
  };
}
