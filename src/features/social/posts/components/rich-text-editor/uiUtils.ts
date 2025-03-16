import React from 'react';

/**
 * Handle click outside of a specified element
 */
export function handleClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: () => void
): () => void {
  function listener(event: MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as unknown as HTMLElement)) {
      callback();
    }
  }

  document.addEventListener('mousedown', listener);
  return () => document.removeEventListener('mousedown', listener);
}

/**
 * Handle global escape key press
 */
export function handleEscapeKey(
  conditions: Record<string, boolean>,
  callbacks: Record<string, () => void>
): () => void {
  function listener(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      // Execute callbacks for conditions that are true
      Object.entries(conditions).forEach(([key, isActive]) => {
        if (isActive && callbacks[key]) {
          callbacks[key]();
        }
      });
    }
  }

  document.addEventListener('keydown', listener);
  return () => document.removeEventListener('keydown', listener);
}

/**
 * Calculate character count styling
 */
export function getCharCountStyling(charCount: number, maxLength: number): string {
  return charCount > maxLength ? 'text-destructive font-medium' : 'text-muted-foreground';
}

/**
 * Get border styling based on character count
 */
export function getBorderStyling(charCount: number, maxLength: number): string {
  return charCount > maxLength ? 'border-2 border-destructive' : '';
}
