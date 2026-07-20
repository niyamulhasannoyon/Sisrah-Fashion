'use client';

import { useEffect, useRef } from 'react';

/**
 * Global lock counter — tracks how many components have requested scroll locking.
 * Body overflow is only restored to '' when ALL locks are released (counter reaches 0).
 * This prevents conflicts when multiple overlays (menu + cart drawer + filter) are open simultaneously.
 */
let lockCount = 0;

/**
 * useLockedBody — a shared hook for locking body scroll.
 * 
 * Usage:
 *   const [isOpen, setIsOpen] = useState(false);
 *   useLockedBody(isOpen);
 * 
 * When `locked` is true, the body scroll is blocked (if not already blocked by another component).
 * When `locked` becomes false (or the component unmounts), the counter decrements.
 * Body scroll is only restored when the counter reaches 0.
 */
export function useLockedBody(locked: boolean) {
  const lockedRef = useRef(locked);

  useEffect(() => {
    lockedRef.current = locked;

    if (locked) {
      lockCount++;
    } else {
      lockCount = Math.max(0, lockCount - 1);
    }

    if (lockCount > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      // Cleanup: if this component was holding a lock, release it
      if (lockedRef.current) {
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount <= 0) {
          document.body.style.overflow = '';
        }
      }
    };
  }, [locked]);
}
