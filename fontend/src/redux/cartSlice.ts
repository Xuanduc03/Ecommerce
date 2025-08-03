import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ThunkAction } from "@reduxjs/toolkit";
import type { AnyAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://localhost:7040/api";

interface CartItem {
  productId: string; // Sử dụng ProductVariantId từ server
  productName: string;
  size?: string;
  color?: string;
  shopId?: string;
  category: string;
  price: number;
  quantity: number;
  images: string[];
  stock?: number;
}

interface CartState {
  items: CartItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Define RootState type (adjust according to your store structure)
interface RootState {
  cart: CartState;
  // Add other slices here
}

// Helper functions
const loadCartFromStorage = (): CartItem[] => {
  try {
    const cart = localStorage.getItem("cart");
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
    return [];
  }
};

const saveCartToStorage = (cart: CartItem[]): void => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

// Mapping from server response to CartItem
const mapServerItemToCartItem = (serverItem: any): CartItem => ({
  productId: serverItem.ProductId,
  productName: serverItem.ProductName || "",
  size: serverItem.Size,
  color: serverItem.ColorName,
  category: serverItem.Category || "", // Cần điều chỉnh nếu server cung cấp
  price: serverItem.Price,
  quantity: serverItem.Quantity,
  images: serverItem.ImageUrl ? [serverItem.ImageUrl] : [],
  stock: serverItem.StockQuantity || undefined,
});

const initialState: CartState = {
  items: loadCartFromStorage(),
  status: "idle",
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    cartActionStart(state) {
      state.status = "loading";
      state.error = null;
    },
    cartActionSuccess(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.status = "succeeded";
      saveCartToStorage(state.items);
    },
    cartActionFailed(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
    addItemLocally(state, action: PayloadAction<CartItem>) {
      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      saveCartToStorage(state.items);
    },
    removeItemLocally(state, action: PayloadAction<{ id: string; color?: string; size?: string }>) {
      const { id, color, size } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.productId === id && item.color === color && item.size === size)
      );
      saveCartToStorage(state.items);
    },
    updateItemQuantity(state, action: PayloadAction<{ id: string; quantity: number; size?: string; color?: string }>) {
      const { id, quantity, size, color } = action.payload;
      const existingItem = state.items.find(
        (item) => item.productId === id && item.size === size && item.color === color
      );

      if (existingItem) {
        existingItem.quantity = quantity;
        if (quantity <= 0) {
          state.items = state.items.filter(
            (item) => !(item.productId === id && item.size === size && item.color === color)
          );
        }
      }
      saveCartToStorage(state.items);
    },
    clearCartLocally(state) {
      state.items = [];
      saveCartToStorage(state.items);
    },
  },
});

// Thunk actions
export const addToCart =
  (item: Omit<CartItem, "quantity"> & { quantity?: number }): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
    async (dispatch, getState) => {
      try {
        dispatch(cartSlice.actions.cartActionStart());

        const token = localStorage.getItem("authToken");
        const userId = token ? getUserIdFromToken(token) : null; // Giả sử hàm getUserIdFromToken
        if (!userId) throw new Error("User not authenticated");

        const quantity = item.quantity || 1;

        // Optimistic UI update
        dispatch(
          cartSlice.actions.addItemLocally({
            ...item,
            quantity,
          })
        );

        // Call API to add item
        await axios.post(
          `${API_URL}/cart/add`,
          {
            UserId: userId,
            ProductVariantId: item.productId,
            Quantity: quantity,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch updated cart from server
        const response = await axios.get(`${API_URL}/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedItems = response.data.Items.map(mapServerItemToCartItem);
        dispatch(cartSlice.actions.cartActionSuccess(updatedItems));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        dispatch(cartSlice.actions.cartActionFailed(errorMsg));
        // Rollback to localStorage on error
        dispatch(cartSlice.actions.cartActionSuccess(loadCartFromStorage()));
      }
    };

export const removeFromCart =
  (itemId: string, userId?: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
    async (dispatch, getState) => {
      try {
        dispatch(cartSlice.actions.cartActionStart());

        const token = localStorage.getItem("authToken");
        const currentUserId = userId || (token ? getUserIdFromToken(token) : null);
        if (!currentUserId) throw new Error("User not authenticated");

        // Optimistic UI update
        const itemToRemove = getState().cart.items.find((item) => item.productId === itemId);
        if (itemToRemove) {
          dispatch(
            cartSlice.actions.removeItemLocally({
              id: itemToRemove.productId,
              color: itemToRemove.color,
              size: itemToRemove.size,
            })
          );
        }

        // Call API to remove item
        await axios.delete(`${API_URL}/cart/${currentUserId}/item/${itemId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch updated cart from server
        const response = await axios.get(`${API_URL}/cart/${currentUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedItems = response.data.Items.map(mapServerItemToCartItem);
        dispatch(cartSlice.actions.cartActionSuccess(updatedItems));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        dispatch(cartSlice.actions.cartActionFailed(errorMsg));
        // Rollback to localStorage on error
        dispatch(cartSlice.actions.cartActionSuccess(loadCartFromStorage()));
      }
    };

export const updateCartItemQuantity =
  (id: string, quantity: number, size?: string, color?: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
    async (dispatch, getState) => {
      try {
        dispatch(cartSlice.actions.cartActionStart());

        const token = localStorage.getItem("authToken");
        const userId = token ? getUserIdFromToken(token) : null;
        if (!userId) throw new Error("User not authenticated");

        // Optimistic UI update
        dispatch(cartSlice.actions.updateItemQuantity({ id, quantity, size, color }));

        // Call API to update quantity
        await axios.put(
          `${API_URL}/cart/update`,
          {
            CartItemId: id, // Sử dụng CartItemId thay vì id
            Quantity: quantity,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Fetch updated cart from server
        const response = await axios.get(`${API_URL}/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedItems = response.data.Items.map(mapServerItemToCartItem);
        dispatch(cartSlice.actions.cartActionSuccess(updatedItems));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        dispatch(cartSlice.actions.cartActionFailed(errorMsg));
        // Rollback to localStorage on error
        dispatch(cartSlice.actions.cartActionSuccess(loadCartFromStorage()));
      }
    };

export const syncCartWithServer =
  (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
    async (dispatch, getState) => {
      try {
        dispatch(cartSlice.actions.cartActionStart());

        const token = localStorage.getItem("authToken");
        const userId = token ? getUserIdFromToken(token) : null;
        if (!userId) throw new Error("User not authenticated");

        const response = await axios.get(`${API_URL}/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedItems = response.data.Items.map(mapServerItemToCartItem);
        dispatch(cartSlice.actions.cartActionSuccess(updatedItems));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        dispatch(cartSlice.actions.cartActionFailed(errorMsg));
      }
    };

export const clearCart =
  (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> =>
    async (dispatch, getState) => {
      try {
        dispatch(cartSlice.actions.cartActionStart());

        const token = localStorage.getItem("authToken");
        const userId = token ? getUserIdFromToken(token) : null;
        if (!userId) throw new Error("User not authenticated");

        // Optimistic UI update
        dispatch(cartSlice.actions.clearCartLocally());

        // Call API to clear cart
        await axios.delete(`${API_URL}/cart/${userId}/clear`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(cartSlice.actions.cartActionSuccess([]));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        dispatch(cartSlice.actions.cartActionFailed(errorMsg));
        // Rollback to localStorage on error
        dispatch(cartSlice.actions.cartActionSuccess(loadCartFromStorage()));
      }
    };

// Helper function to extract userId from token (giả định)
const getUserIdFromToken = (token: string): string => {
  // Giả sử token được decode để lấy userId (cần thư viện như jwt-decode)
  // Ví dụ: return jwtDecode(token).sub as string;
  return "example-user-id"; // Thay bằng logic thực tế
};

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartStatus = (state: RootState) => state.cart.status;
export const selectCartError = (state: RootState) => state.cart.error;
export const selectCartTotal = (state: RootState) =>
  state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
export const selectCartItemsCount = (state: RootState) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

// Export actions
export const {
  addItemLocally,
  removeItemLocally,
  updateItemQuantity,
  clearCartLocally,
  cartActionStart,
  cartActionSuccess,
  cartActionFailed,
} = cartSlice.actions;

export default cartSlice.reducer;