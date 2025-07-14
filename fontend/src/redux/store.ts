import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from './categorySlice';
import cartReducer from './cartSlice';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    cart: cartReducer,
    auth: authReducer,
  },
});

// ✅ Thêm 2 dòng này để fix lỗi
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
