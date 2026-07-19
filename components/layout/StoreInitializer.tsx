'use client';

import { useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface StoreInitializerProps {
  settings?: any;
}

export default function StoreInitializer({ settings }: StoreInitializerProps) {
  const initialized = useRef(false);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);
  
  // Hydration-safe: useEffect runs only on client
  useEffect(() => {
    if (settings && !initialized.current) {
      // Server-preloaded settings — apply immediately
      useSettingsStore.setState({ settings, loading: false });
      initialized.current = true;
    } else if (!initialized.current) {
      // No server data — fetch on client
      fetchSettings();
      initialized.current = true;
    }
  }, [settings, fetchSettings]);
  
  return null;
}
