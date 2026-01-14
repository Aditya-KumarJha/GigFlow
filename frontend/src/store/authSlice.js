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
  isAuthenticated: Boolean(localStorage.getItem('authToken')) || checkCookie(),
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
    setAuthenticated(state, action) {
      state.isAuthenticated = true;
      if (action.payload?.token) {
        try { localStorage.setItem('authToken', action.payload.token); } catch(e) {}
      }
    },
    setLoggedOut(state) {
      state.isAuthenticated = false;
      try { localStorage.removeItem('authToken'); } catch(e) {}
    },
    initializeAuth(state) {
      state.isAuthenticated = Boolean(localStorage.getItem('authToken')) || checkCookie();
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
        state.isAuthenticated = Boolean(localStorage.getItem('authToken')) || checkCookie();
        state.checked = true;
        state.user = null;
      });
  }
});

export const { setAuthenticated, setLoggedOut, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
