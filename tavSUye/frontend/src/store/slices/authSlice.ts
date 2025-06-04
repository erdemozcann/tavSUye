import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  twoFactorRequired: boolean;
}

const defaultUser: User = {
  userId: 1,
  username: "demo.user",
  email: "demo.user@sabanciuniv.edu",
  name: "Demo",
  surname: "User",
  role: "STUDENT",
  emailVerified: true,
  is2FAEnabled: false,
  accountStatus: "ACTIVE",
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  twoFactorRequired: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload || defaultUser;
      state.isAuthenticated = true;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTwoFactorRequired: (state, action: PayloadAction<boolean>) => {
      state.twoFactorRequired = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.twoFactorRequired = false;
    },
  },
});

export const { setUser, setLoading, setError, setTwoFactorRequired, logout } = authSlice.actions;
export default authSlice.reducer; 