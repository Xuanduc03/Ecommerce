import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string;
  name: string;
  role: string;
  userId: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

const loadInitialUser = (): User | null => {
  const userJson = localStorage.getItem('authUser');
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Lỗi parse authUser từ localStorage:', error);
    return null;
  }
};

const initialState: AuthState = {
  token: localStorage.getItem('authToken') || null,
  user: loadInitialUser(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;

      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('authUser', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;

      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
