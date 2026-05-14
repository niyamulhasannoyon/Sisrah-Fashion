import { create } from 'zustand';

interface Settings {
  logo: string;
  whatsappNumber: string;
  heroImage: string;
  ethosImage: string;
  communityImages: { url: string; public_id: string }[];
}

interface SettingsState {
  settings: Settings | null;
  loading: boolean;
  fetchSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  loading: false,
  fetchSettings: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        set({ settings: data.settings, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ loading: false });
    }
  },
}));
