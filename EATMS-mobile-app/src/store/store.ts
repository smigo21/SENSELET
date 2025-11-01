import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cropsReducer from './slices/cropsSlice';
import marketPricesReducer from './slices/marketPricesSlice';
import shipmentsReducer from './slices/shipmentsSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    crops: cropsReducer,
    marketPrices: marketPricesReducer,
    shipments: shipmentsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
