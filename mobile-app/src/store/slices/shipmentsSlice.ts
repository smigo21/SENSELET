import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Shipment } from '../types';

interface ShipmentsState {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  shipments: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchShipments = createAsyncThunk(
  'shipments/fetchShipments',
  async (filters?: { status?: string; farmer_id?: string }) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`/api/shipments/?${queryParams}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch shipments');
    }
    
    return response.json();
  }
);

export const updateShipmentStatus = createAsyncThunk(
  'shipments/updateShipmentStatus',
  async ({ id, status }: { id: string; status: string }) => {
    const response = await fetch(`/api/shipments/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update shipment status');
    }
    
    return response.json();
  }
);

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action) => {
        state.loading = false;
        state.shipments = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shipments';
      })
      .addCase(updateShipmentStatus.fulfilled, (state, action) => {
        const index = state.shipments.findIndex(shipment => shipment.id === action.payload.id);
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
      });
  },
});

export const { clearError } = shipmentsSlice.actions;
export default shipmentsSlice.reducer;
