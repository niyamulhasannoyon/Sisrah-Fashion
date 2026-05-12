import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  availableSizes?: string[]; 
  availableColors?: string[];
}

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  toggleCart: () => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  updateItemVariant: (id: string, oldSize: string, oldColor: string, newSize: string, newColor: string) => void;
  getCartTotal: () => number;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      
      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),

      addToCart: (item) => {
        const cart = get().cart;
        const existingItem = cart.find(
          (c) => c._id === item._id && c.selectedSize === item.selectedSize && c.selectedColor === item.selectedColor
        );

        if (existingItem) {
          set({
            cart: cart.map((c) =>
              c === existingItem ? { ...c, quantity: c.quantity + 1 } : c
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }] });
        }
        set({ isCartOpen: true });
      },

      removeFromCart: (id, size, color) => {
        set({ cart: get().cart.filter((item) => !(item._id === id && item.selectedSize === size && item.selectedColor === color)) });
      },

      updateQuantity: (id, size, color, quantity) => {
        if (quantity < 1) return;
        set({
          cart: get().cart.map((item) =>
            item._id === id && item.selectedSize === size && item.selectedColor === color ? { ...item, quantity } : item
          ),
        });
      },

      updateItemVariant: (id, oldSize, oldColor, newSize, newColor) => {
        set((state) => {
          const cart = [...state.cart];
          const existingIdx = cart.findIndex(i => i._id === id && i.selectedSize === oldSize && i.selectedColor === oldColor);
          if (existingIdx === -1) return state;

          const itemToUpdate = cart[existingIdx];
          const targetIdx = cart.findIndex(i => i._id === id && i.selectedSize === newSize && i.selectedColor === newColor);

          if (targetIdx !== -1 && targetIdx !== existingIdx) {
            cart[targetIdx].quantity += itemToUpdate.quantity;
            cart.splice(existingIdx, 1);
          } else {
            cart[existingIdx] = { ...itemToUpdate, selectedSize: newSize, selectedColor: newColor };
          }
          return { cart };
        });
      },

      getCartTotal: () => get().cart.reduce((total, item) => total + item.price * item.quantity, 0),
      clearCart: () => set({ cart: [] }),
    }),
    { name: 'loomra-cart' }
  )
);
