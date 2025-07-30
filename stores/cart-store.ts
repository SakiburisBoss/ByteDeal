import {
  getOrCreateCart,
  syncCartWithUser,
  updateCartItem,
} from "@/lib/actions/cart-actions";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
};

type CartStore = {
  items: CartItem[];
  isLoaded: boolean;
  isOpen: boolean;
  cartId: string | null;
  setStore: (store: Partial<CartStore>) => void;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  open: () => void;
  close: () => void;
  setLoaded: (loaded: boolean) => void;
  syncWithUser: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

// Helper function to check if we're on the client side
const isClient = typeof window !== 'undefined';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoaded: isClient ? false : true, // Set to true on server to prevent hydration mismatch
      cartId: null,

      setStore: (store) => set(store),

      addItem: async (item) => {
        const { items } = get();
        let { cartId } = get();

        // If no cart exists, create a new one
        if (!cartId) {
          const newCart = await getOrCreateCart();
          if (!newCart) {
            console.error("Failed to create new cart");
            return;
          }
          set((state) => ({ ...state, cartId: newCart.id }));
          cartId = newCart.id;
        }

        try {
          // Check if item already exists in the cart by ID (exact match)
          const existingItem = items.find((i) => i.id === item.id);

          // If item exists with the same ID, update quantity
          if (existingItem) {
            return get().updateQuantity(
              item.id,
              existingItem.quantity + item.quantity
            );
          }

          // Check if we have the same product (by title and price) with a different ID
          // This can happen if the product was added in a different session or context
          const existingProductItem = items.find(
            (i) =>
              i.title.toLowerCase() === item.title.toLowerCase() &&
              i.price === item.price
          );

          // If we found the same product with a different ID, update its quantity
          if (existingProductItem) {
            return get().updateQuantity(
              existingProductItem.id,
              existingProductItem.quantity + item.quantity
            );
          }

          // If this is a completely new item, add it to the cart
          const updatedCart = await updateCartItem(cartId, item.id, {
            title: item.title,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          });

          if (!updatedCart) {
            throw new Error("Failed to update cart");
          }

          // Update local state
          set((state) => {
            // Ensure we don't have duplicate items in the local state
            const itemExists = state.items.some((i) => i.id === item.id);
            return {
              ...state,
              cartId: updatedCart.id,
              items: itemExists
                ? state.items.map((i) =>
                    i.id === item.id
                      ? { ...i, quantity: i.quantity + item.quantity }
                      : i
                  )
                : [...state.items, { ...item }],
            };
          });
        } catch (error) {
          console.error("Error adding item to cart:", error);
          throw error;
        }
      },

      removeItem: async (id) => {
        const { cartId } = get();
        if (!cartId) {
          return;
        }

        const updatedCart = await updateCartItem(cartId, id, {
          quantity: 0,
        });

        set((state) => {
          return {
            ...state,
            cartId: updatedCart.id,
            items: state.items.filter((item) => item.id !== id),
          };
        });
      },

      updateQuantity: async (id, quantity) => {
        const { cartId, items } = get();
        if (!cartId) {
          console.error("No cart ID available");
          return;
        }

        // Find the item to update
        const itemToUpdate = items.find((item) => item.id === id);
        if (!itemToUpdate) {
          console.error("Item not found in cart");
          return;
        }

        // Update quantity in database
        const updatedCart = await updateCartItem(cartId, id, {
          title: itemToUpdate.title,
          price: itemToUpdate.price,
          image: itemToUpdate.image,
          quantity: Math.max(0, quantity), // Ensure quantity is not negative
        });

        if (!updatedCart) {
          throw new Error("Failed to update cart");
        }

        // Update local state
        set((state) => {
          const updatedItems =
            quantity > 0
              ? state.items.map((item) =>
                  item.id === id ? { ...item, quantity } : item
                )
              : state.items.filter((item) => item.id !== id);

          return {
            ...state,
            cartId: updatedCart.id,
            items: updatedItems,
          };
        });
      },

      syncWithUser: async (): Promise<void> => {
        const { cartId } = get();
        const currentCart = cartId || null;

        try {
          // If user is signing in, sync their anonymous cart with their account
          const syncedCart = await syncCartWithUser(currentCart);

          if (syncedCart) {
            set((state) => ({
              ...state,
              cartId: syncedCart.id,
              items: syncedCart.items || [],
              isLoaded: true,
            }));
            return;
          }

          // If no sync happened but we have a cart, ensure it's loaded
          if (currentCart) {
            const cart = await getOrCreateCart(currentCart);
            if (cart) {
              set((state) => ({
                ...state,
                cartId: cart.id,
                items: cart.items || [],
                isLoaded: true,
              }));
              return;
            }
          }

          // If we get here, create a new cart
          const newCart = await getOrCreateCart();
          set((state) => ({
            ...state,
            cartId: newCart.id,
            items: newCart.items || [],
            isLoaded: true,
          }));
        } catch (error) {
          console.error("Error syncing cart with user:", error);
          // If sync fails, ensure we still have a valid cart
          const cart = await getOrCreateCart(currentCart);
          set((state) => ({
            ...state,
            cartId: cart.id,
            items: cart.items || [],
            isLoaded: true,
          }));
        }
      },

      clearCart: () => {
        set((state) => ({ ...state, items: [] }));
      },

      open: () => {
        set((state) => ({ ...state, isOpen: true }));
      },
      close: () => {
        set((state) => ({ ...state, isOpen: false }));
      },

      setLoaded: (loaded) => {
        set((state) => ({ ...state, isLoaded: loaded }));
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
      // Only persist specific state properties
      partialize: (state) => ({
        items: state.items,
        cartId: state.cartId,
      }),
      // Skip hydration on the server
      skipHydration: true,
    }
  )
);
