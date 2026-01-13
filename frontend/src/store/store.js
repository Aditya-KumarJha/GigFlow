import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import gigsReducer from './gigsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    gigs: gigsReducer,
  },
});

export default store;
