import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MinimalProduct {
  _id: string;
  slug: string;
  title: string;
  price: number;
  image: string;
}

interface RecentState {
  history: MinimalProduct[];
  addRecent: (product: MinimalProduct) => void;
}

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      history: [],
      addRecent: (product) => set((state) => {
        // Remove product if it already exists to avoid duplicates
        const filteredHistory = state.history.filter((p) => p._id !== product._id);
        
        // Add to the front of the array, keep only the last 5 items
        return {
          history: [product, ...filteredHistory].slice(0, 5),
        };
      }),
    }),
    { name: 'loomra-recent-views' }
  )
);
