// store/authSlice.js
// Token is persisted to AsyncStorage so it survives app restarts.
// On app boot, LoginScreen (or App.js) calls loadPersistedToken() before rendering.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'authToken';

// Call this once from App.js on startup to rehydrate the token
export const loadPersistedToken = createAsyncThunk(
  'auth/loadPersistedToken',
  async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token; // null if not found
  }
);

const initialState = {
  token: null,
  isAuthenticated: false,
  isLoading: true, // true until loadPersistedToken resolves
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      // Persist to AsyncStorage (fire-and-forget — Redux state is the truth)
      AsyncStorage.setItem(TOKEN_KEY, action.payload).catch(() => {});
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      AsyncStorage.removeItem(TOKEN_KEY).catch(() => {});
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPersistedToken.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload;
          state.isAuthenticated = true;
        }
        state.isLoading = false;
      })
      .addCase(loadPersistedToken.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
