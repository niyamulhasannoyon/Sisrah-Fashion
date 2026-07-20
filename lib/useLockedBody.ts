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

    console.log(`[useLockedBody] ID: ${id}, locked parameter: ${locked}, before update Set size: ${activeLocks.size}`);

    if (locked) {
      activeLocks.add(id);
    } else {
      activeLocks.delete(id);
    }

    console.log(`[useLockedBody] ID: ${id}, after update Set size: ${activeLocks.size}, Set content:`, Array.from(activeLocks));

    if (activeLocks.size > 0) {
      document.body.style.overflow = 'hidden';
      console.log(`[useLockedBody] Set body overflow to 'hidden' due to active locks`);
    } else {
      document.body.style.overflow = '';
      console.log(`[useLockedBody] Restored body overflow to ''`);
    }
  }, [locked]);

  // Handle cleanup on component unmount
  useEffect(() => {
    return () => {
      const id = idRef.current;
      console.log(`[useLockedBody Cleanup] Component unmounted. ID: ${id}, existed in Set: ${activeLocks.has(id)}`);
      if (activeLocks.has(id)) {
        activeLocks.delete(id);
        console.log(`[useLockedBody Cleanup] Released lock for ID: ${id}. Remaining active locks:`, Array.from(activeLocks));
        if (activeLocks.size === 0) {
          document.body.style.overflow = '';
          console.log(`[useLockedBody Cleanup] Restored body overflow to ''`);
        }
      }
    };
  }, []);
}
