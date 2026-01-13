import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// State shape described by the user
const initialState = {
  byGigId: {},
  hiring: false,
};

export const fetchBidsForGig = createAsyncThunk(
  'bids/fetchBidsForGig',
  async (gigId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/bids/${gigId}`);
      return { gigId, bids: res.data.bids };
    } catch (err) {
      const status = err.response?.status || 0;
      return rejectWithValue({ status, message: err.message });
    }
  }
);

export const submitBid = createAsyncThunk(
  'bids/submitBid',
  async ({ gigId, message, price }, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/bids', { gigId, message, price });
      return { gigId, bid: res.data.bid || res.data };
    } catch (err) {
      const status = err.response?.status || 0;
      return rejectWithValue({ status, message: err.message });
    }
  }
);

export const hireBid = createAsyncThunk(
  'bids/hireBid',
  async ({ bidId, gigId }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/api/bids/${bidId}/hire`);
      return { bid: res.data.bid || res.data, gigId };
    } catch (err) {
      const status = err.response?.status || 0;
      return rejectWithValue({ status, message: err.message });
    }
  }
);

const bidsSlice = createSlice({
  name: 'bids',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBidsForGig.pending, (state, action) => {
        const gid = action.meta.arg;
        state.byGigId[gid] = state.byGigId[gid] || { items: [], loading: false, error: null };
        state.byGigId[gid].loading = true;
        state.byGigId[gid].error = null;
      })
      .addCase(fetchBidsForGig.fulfilled, (state, action) => {
        const { gigId, bids } = action.payload;
        state.byGigId[gigId] = { items: bids || [], loading: false, error: null };
      })
      .addCase(fetchBidsForGig.rejected, (state, action) => {
        const gid = action.meta.arg;
        const payload = action.payload || {};
        state.byGigId[gid] = state.byGigId[gid] || { items: [], loading: false, error: null };
        state.byGigId[gid].loading = false;
        state.byGigId[gid].error = payload.status === 403 ? 'forbidden' : (payload.message || 'Failed to load bids');
      })

      .addCase(submitBid.pending, (state, action) => {
        const gid = action.meta.arg?.gigId;
        if (!gid) return;
        state.byGigId[gid] = state.byGigId[gid] || { items: [], loading: false, error: null };
        state.byGigId[gid].loading = true;
        state.byGigId[gid].error = null;
      })
      .addCase(submitBid.fulfilled, (state, action) => {
        const { gigId, bid } = action.payload;
        state.byGigId[gigId] = state.byGigId[gigId] || { items: [], loading: false, error: null };
        state.byGigId[gigId].loading = false;
        // append
        state.byGigId[gigId].items.push(bid);
      })
      .addCase(submitBid.rejected, (state, action) => {
        const gid = action.meta.arg?.gigId;
        if (!gid) return;
        state.byGigId[gid] = state.byGigId[gid] || { items: [], loading: false, error: null };
        state.byGigId[gid].loading = false;
        state.byGigId[gid].error = action.payload?.message || 'Failed to submit bid';
      })

      .addCase(hireBid.pending, (state, action) => {
        state.hiring = true;
      })
      .addCase(hireBid.fulfilled, (state, action) => {
        state.hiring = false;
        const { bid, gigId } = action.payload;
        const gid = gigId || (bid && bid.gigId && (bid.gigId._id || bid.gigId));
        if (!gid) return;
        state.byGigId[gid] = state.byGigId[gid] || { items: [], loading: false, error: null };
        // mark hired and reject others
        state.byGigId[gid].items = (state.byGigId[gid].items || []).map((b) => {
          if (!b) return b;
          if (String(b._id) === String(bid._id) || String(b._id) === String(bid.id)) {
            return { ...b, status: 'hired' };
          }
          return { ...b, status: 'rejected' };
        });
      })
      .addCase(hireBid.rejected, (state, action) => {
        state.hiring = false;
        // optional: set global error; for now attach to gig if provided
        const gid = action.meta.arg?.gigId;
        if (gid) {
          state.byGigId[gid] = state.byGigId[gid] || { items: [], loading: false, error: null };
          state.byGigId[gid].error = action.payload?.message || 'Failed to hire';
        }
      });
  },
});

export default bidsSlice.reducer;
