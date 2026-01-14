import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

const checkCookie = () => {
  try {
    return document.cookie.split(';').some(c => c.trim().startsWith('token='));
  } catch (e) {
    return false;
  }
};

const initialState = {
  isAuthenticated: checkCookie(),
  checked: false, 
  user: null,
};

export const verifySession = createAsyncThunk('auth/verifySession', async () => {
  const res = await api.get('/api/auth/me');
  return res.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state) {
      state.isAuthenticated = true;
    },
    setLoggedOut(state) {
      state.isAuthenticated = false;
    },
    initializeAuth(state) {
      state.isAuthenticated = checkCookie();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifySession.pending, (state) => {
        state.checked = false;
      })
      .addCase(verifySession.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.checked = true;
        state.user = action.payload?.user || action.payload || null;
      })
      .addCase(verifySession.rejected, (state, action) => {
        state.isAuthenticated = checkCookie();
        state.checked = true;
        state.user = null;
      });
  }
});

export const { setAuthenticated, setLoggedOut, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
