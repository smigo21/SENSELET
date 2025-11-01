import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MarketPrice } from '../types';

interface MarketPricesState {
  prices: MarketPrice[];
  loading: boolean;
  error: string | null;
}

const initialState: MarketPricesState = {
  prices: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchMarketPrices = createAsyncThunk(
  'marketPrices/fetchMarketPrices',
  async (filters?: { crop?: string; region?: string }) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/market-prices/?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch market prices');
    }
    
    return response.json();
  }
);

const marketPricesSlice = createSlice({
  name: 'marketPrices',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMarketPrices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketPrices.fulfilled, (state, action) => {
        state.loading = false;
        state.prices = action.payload;
      })
      .addCase(fetchMarketPrices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch market prices';
      });
  },
});

export const { clearError } = marketPricesSlice.actions;
export default marketPricesSlice.reducer;
