import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface ComPort {
  path: string
  manufacturer?: string
  vendorId?: string
  productId?: string
}

interface ComPortState {
  comPorts: ComPort[]
  selectedComPort: string | null
  currentOpenPort: string | null
  loading: boolean
  error: string | null
}

const initialState: ComPortState = {
  comPorts: [],
  selectedComPort: null,
  currentOpenPort: null,
  loading: false,
  error: null,
}

export const fetchComPort = createAsyncThunk('comPort/fetch', async () => {
  const result = await window.api.serial.list()
  if (result.success === false) {
    throw new Error(result.error || 'Failed to fetch COM ports')
  }
  return result
})

const comPortSlice = createSlice({
  name: 'comPort',
  initialState,
  reducers: {
    setSelectedComPort(state, action: PayloadAction<string | null>) {
      state.selectedComPort = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComPort.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComPort.fulfilled, (state, action) => {
        state.comPorts = action.payload.availablePorts
        state.currentOpenPort = action.payload.currentOpenPort ?? null
        state.loading = false
      })
      .addCase(fetchComPort.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load COM ports'
      })
  },
})

export const { setSelectedComPort } = comPortSlice.actions
export default comPortSlice.reducer
