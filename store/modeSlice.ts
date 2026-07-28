import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ModeState = 'code' | 'ai box' | 'games'

const initialState: ModeState = 'code'

const modeSlice = createSlice({
  name: 'mode',
  initialState,
  reducers: {
    setMode: (_, action: PayloadAction<ModeState>) => action.payload,
  },
})

export const { setMode } = modeSlice.actions
export default modeSlice.reducer
