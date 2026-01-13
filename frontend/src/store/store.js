import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import gigsReducer from './gigsSlice';
import bidsReducer from './bidsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigsReducer,
    bids: bidsReducer,
  },
});

export default store;
