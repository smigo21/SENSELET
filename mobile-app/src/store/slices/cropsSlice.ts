import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Crop } from '../types';

interface CropsState {
  crops: Crop[];
  loading: boolean;
  error: string | null;
}

const initialState: CropsState = {
  crops: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCrops = createAsyncThunk(
  'crops/fetchCrops',
  async () => {
    const response = await fetch('/api/crops/');
    if (!response.ok) {
      throw new Error('Failed to fetch crops');
    }
    return response.json();
  }
);

export const addCrop = createAsyncThunk(
  'crops/addCrop',
  async (cropData: Omit<Crop, 'id' | 'farmer_id'>) => {
    const response = await fetch('/api/crops/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cropData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add crop');
    }
    
    return response.json();
  }
);

export const updateCrop = createAsyncThunk(
  'crops/updateCrop',
  async ({ id, ...updateData }: Partial<Crop> & { id: string }) => {
    const response = await fetch(`/api/crops/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update crop');
    }
    
    return response.json();
  }
);

const cropsSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch crops
      .addCase(fetchCrops.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrops.fulfilled, (state, action) => {
        state.loading = false;
        state.crops = action.payload;
      })
      .addCase(fetchCrops.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch crops';
      })
      // Add crop
      .addCase(addCrop.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCrop.fulfilled, (state, action) => {
        state.loading = false;
        state.crops.push(action.payload);
      })
      .addCase(addCrop.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add crop';
      })
      // Update crop
      .addCase(updateCrop.fulfilled, (state, action) => {
        const index = state.crops.findIndex(crop => crop.id === action.payload.id);
        if (index !== -1) {
          state.crops[index] = action.payload;
        }
      });
  },
});

export const { clearError } = cropsSlice.actions;
export default cropsSlice.reducer;
