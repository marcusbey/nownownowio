import { useState, useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<void>;
  onError?: (error: Error) => void;
}

export function useOptimisticUpdate<T>({ onUpdate, onError }: OptimisticUpdateOptions<T>) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (data: T) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      await onUpdate(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Update failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsUpdating(false);
    }
  }, [onUpdate, onError]);

  return {
    isUpdating,
    error,
    update
  };
}
