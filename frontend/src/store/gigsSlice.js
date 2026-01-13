import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchGigs = createAsyncThunk(
  'gigs/fetchGigs',
  async ({ search = '', page = 1, limit = 10, status = '' } = {}) => {
    const params = new URLSearchParams({ search, page: String(page), limit: String(limit) });
    if (status !== undefined) params.set('status', String(status));
    const res = await fetch(`${API_BASE_URL}/api/gigs?${params.toString()}`, { credentials: 'include' });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const err = new Error(data?.message || 'Failed to fetch gigs');
      err.response = { status: res.status, data };
      throw err;
    }
    const json = await res.json();
    return json;
  }
);

// formPayload: FormData, tempId optional
export const createGig = createAsyncThunk(
  'gigs/createGig',
  async ({ formPayload, tempId } = {}) => {
    const res = await fetch(`${API_BASE_URL}/api/gigs`, {
      method: 'POST',
      credentials: 'include',
      body: formPayload,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const err = new Error(data?.message || 'Failed to create gig');
      err.response = { status: res.status, data };
      throw err;
    }

    const json = await res.json();
    // include tempId so reducers can reconcile optimistic update
    return { ...json, __tempId: tempId };
  }
);

const initialState = {
  items: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: false,
  creating: false,
  error: null,
};

const gigsSlice = createSlice({
  name: 'gigs',
  initialState,
  reducers: {
    addLocalGig(state, action) {
      // Optimistic local gig; append at start
      state.items.unshift(action.payload);
    },
    replaceLocalGig(state, action) {
      const { tempId, gig } = action.payload;
      const idx = state.items.findIndex(i => i._id === tempId || i.__tempId === tempId);
      if (idx !== -1) {
        state.items[idx] = gig;
      } else {
        state.items.unshift(gig);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGigs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGigs.fulfilled, (state, action) => {
        state.loading = false;
        const fetched = action.payload.gigs || [];

        // Preserve optimistic local items (tempId or __local) at the top
        const localOptimistic = (state.items || []).filter(i => i.__tempId || i.__local);

        // Filter out any fetched items that duplicate local optimistic items
        const filteredFetched = fetched.filter(f => !localOptimistic.some(l => l._id === f._id || l.__tempId === f._id || l._id === l.__tempId));

        state.items = [...localOptimistic, ...filteredFetched];
        state.meta = action.payload.meta || state.meta;
      })
      .addCase(fetchGigs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load gigs';
      })

      .addCase(createGig.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createGig.fulfilled, (state, action) => {
        state.creating = false;
        const payload = action.payload;
        const serverGig = payload.gig || payload;
        const tempId = payload.__tempId;

        if (tempId) {
          const idx = state.items.findIndex(i => i._id === tempId || i.__tempId === tempId);
          if (idx !== -1) {
            state.items[idx] = serverGig;
            return;
          }
        }

        // otherwise prepend
        state.items.unshift(serverGig);
      })
      .addCase(createGig.rejected, (state, action) => {
        state.creating = false;
        state.error = action.error.message || 'Failed to create gig';
      });
  }
});

export const { addLocalGig, replaceLocalGig } = gigsSlice.actions;
export default gigsSlice.reducer;
