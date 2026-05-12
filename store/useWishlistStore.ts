import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  wishlist: any[];
  toggleWishlist: (product: any) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: [],
      toggleWishlist: (product: any) => {
        const isExist = get().wishlist.find((p: any) => p._id === product._id);
        if (isExist) {
          set({ wishlist: get().wishlist.filter((p: any) => p._id !== product._id) });
        } else {
          set({ wishlist: [...get().wishlist, product] });
        }
      }
    }),
    { name: 'loomra-wishlist' }
  )
);

export default useWishlistStore;
