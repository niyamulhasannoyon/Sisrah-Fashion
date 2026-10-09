import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackAddToWishlist } from '@/lib/analytics/trackEvents';

interface WishlistState {
  wishlist: any[];
  isWishlistOpen: boolean;
  toggleWishlistDrawer: () => void;
  toggleWishlist: (product: any) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      isWishlistOpen: false,
      
      toggleWishlistDrawer: () => set({ isWishlistOpen: !get().isWishlistOpen }),

      toggleWishlist: (product: any) => {
        const isExist = get().wishlist.find((p: any) => p._id === product._id);
        if (isExist) {
          set({ wishlist: get().wishlist.filter((p: any) => p._id !== product._id) });
        } else {
          set({ wishlist: [...get().wishlist, product] });
          try {
            trackAddToWishlist({
              id: product._id,
              title: product.title,
              price: product.offerPrice || product.basePrice || product.price || 0,
            });
          } catch (err) {
            console.warn('[WishlistStore] Failed to track AddToWishlist:', err);
          }
        }
      }
    }),
    { 
      name: 'loomra-wishlist',
      partialize: (state) => ({ wishlist: state.wishlist }), // Only persist the wishlist items, not UI state
    }
  )
);

export default useWishlistStore;
