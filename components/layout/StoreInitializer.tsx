'use client';

import { useRef } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface StoreInitializerProps {
  settings: any;
}

export default function StoreInitializer({ settings }: StoreInitializerProps) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    useSettingsStore.setState({ settings, loading: false });
    initialized.current = true;
  }
  
  return null;
}
