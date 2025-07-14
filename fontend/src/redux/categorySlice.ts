import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Types
interface Category {
  _id: string;
  name: string;
  image?: string;
  description?: string;
}

interface Subcategory extends Category {
  parentId: string;
}

interface CategoryState {
  subCategories: Subcategory[];
  selectedCategory: Category | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

interface ApiResponse {
  data: Subcategory[];
  status: string;
  message?: string;
}

// Constants
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Async Thunk
export const fetchSubCategories = createAsyncThunk(
  "categories/fetchSubCategories",
  async (parentId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<ApiResponse>(
        `${BASE_URL}/subcategories/${parentId}`
      );

      if (!response.data) {
        throw new Error('Không có dữ liệu');
      }

      return response.data;
    } catch (error: any) {
       const message = error?.response?.data?.message 
        || error?.message 
        || 'Đã xảy ra lỗi không mong muốn';

      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState: CategoryState = {
  subCategories: [],
  selectedCategory: null,
  status: "idle",
  error: null,
};

// Slice
const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category>) => {
      state.selectedCategory = action.payload;
    },
    clearCategories: (state) => {
      state.subCategories = [];
      state.status = 'idle';
      state.error = null;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.subCategories = action.payload.data;
        state.error = null;
      })
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string || 'Đã xảy ra lỗi';
      });
  },
});

// Exports
export const { 
  setSelectedCategory, 
  clearCategories,
  resetError 
} = categorySlice.actions;

export default categorySlice.reducer;

// Type exports
export type { 
  Category, 
  Subcategory, 
  CategoryState, 
  ApiResponse 
};

// Selectors
export const selectCategories = (state: { categories: CategoryState }) => state.categories.subCategories;
export const selectSelectedCategory = (state: { categories: CategoryState }) => state.categories.selectedCategory;
export const selectCategoryStatus = (state: { categories: CategoryState }) => state.categories.status;
export const selectCategoryError = (state: { categories: CategoryState }) => state.categories.error;
