'use client';

import { useRef, useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface StoreInitializerProps {
  settings?: any;
}

export default function StoreInitializer({ settings }: StoreInitializerProps) {
  const initialized = useRef(false);
  const fetchSettings = useSettingsStore((state) => state.fetchSettings);

  // Synchronous server/client render hydration
  if (settings && !initialized.current) {
    useSettingsStore.setState({ settings, loading: false });
    initialized.current = true;
  }
  
  // Hydration-safe client-side backup
  useEffect(() => {
    if (!initialized.current) {
      fetchSettings();
      initialized.current = true;
    }
  }, [fetchSettings]);
  
  return null;
}
