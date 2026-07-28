import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('themeSettings')
    return saved ? JSON.parse(saved) : null
  } catch (e) {
    console.error("Failed to load theme settings:", e)
    return null
  }
}

const initialState =
  loadFromLocalStorage() || {
    mode: 'light', // or 'dark'
    sfx: 'on',
    music: 'on',
  }

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.mode = action.payload
      localStorage.setItem('themeSettings', JSON.stringify(state))
    },
    setSfx: (state, action: PayloadAction<'on' | 'off'>) => {
      state.sfx = action.payload
      localStorage.setItem('themeSettings', JSON.stringify(state))
    },
    setMusic: (state, action: PayloadAction<'on' | 'off'>) => {
      state.music = action.payload
      localStorage.setItem('themeSettings', JSON.stringify(state))
    },
    toggleSfx: (state) => {
      state.sfx = state.sfx === 'on' ? 'off' : 'on'
      localStorage.setItem('themeSettings', JSON.stringify(state))
    },
    toggleMusic: (state) => {
      state.music = state.music === 'on' ? 'off' : 'on'
      localStorage.setItem('themeSettings', JSON.stringify(state))
    },
    toggleTheme(state) {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
      localStorage.setItem('themeSettings', JSON.stringify(state))
    },
  },
})

export const { setTheme, setSfx, setMusic, toggleSfx, toggleMusic, toggleTheme } =
  themeSlice.actions
export default themeSlice.reducer