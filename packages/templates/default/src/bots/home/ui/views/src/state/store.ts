import { configureStore } from '@reduxjs/toolkit';
import userPreferences from './userPreferences/userPreferences';

export const store = configureStore({
  reducer: {
    userPreferences,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type StateDispatch = typeof store.dispatch;
