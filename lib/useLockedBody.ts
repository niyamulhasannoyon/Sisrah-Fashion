'use client';

import { useEffect, useRef } from 'react';

/**
 * Global active locks tracking set — keeps track of all active scroll locks by unique ID.
 * Body scroll is only restored to '' when ALL locks are released (the set becomes empty).
 * This prevents conflicts and race conditions when multiple overlay elements (mobile menus,
 * cart drawer, modal filters) are opened and closed simultaneously.
 */
const activeLocks = new Set<string>();

/**
 * useLockedBody — a shared hook for locking body scroll.
 * 
 * Usage:
 *   const [isOpen, setIsOpen] = useState(false);
 *   useLockedBody(isOpen);
 * 
 * When `locked` is true, the body scroll is blocked (if not already blocked by another component).
 * When `locked` becomes false (or the component unmounts), the lock is released.
 * Body scroll is only restored when all active locks are cleared.
 */
export function useLockedBody(locked: boolean) {
  // Generate a unique identifier for this hook instance to prevent cross-component state contamination
  const idRef = useRef<string>('');
  
  if (!idRef.current) {
    idRef.current = 'lock_' + Math.random().toString(36).substring(2, 9);
  }

  useEffect(() => {
    const id = idRef.current;

    if (locked) {
      activeLocks.add(id);
    } else {
      activeLocks.delete(id);
    }

    if (activeLocks.size > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [locked]);

  // Handle cleanup on component unmount
  useEffect(() => {
    return () => {
      const id = idRef.current;
      if (activeLocks.has(id)) {
        activeLocks.delete(id);
        if (activeLocks.size === 0) {
          document.body.style.overflow = '';
        }
      }
    };
  }, []);
}
