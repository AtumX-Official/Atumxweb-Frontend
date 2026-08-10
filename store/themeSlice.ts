import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ThemeState {
  mode: "light" | "dark";
  sfx: "on" | "off";
  music: "on" | "off";
}

const initialState: ThemeState = {
  mode: "light",
  sfx: "on",
  music: "on",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,

  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.mode = action.payload;
    },

    setSfx: (state, action: PayloadAction<"on" | "off">) => {
      state.sfx = action.payload;
    },

    setMusic: (state, action: PayloadAction<"on" | "off">) => {
      state.music = action.payload;
    },

    toggleSfx: (state) => {
      state.sfx = state.sfx === "on" ? "off" : "on";
    },

    toggleMusic: (state) => {
      state.music = state.music === "on" ? "off" : "on";
    },

    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },

    loadThemeSettings: (
      state,
      action: PayloadAction<Partial<ThemeState>>
    ) => {
      if (action.payload.mode) {
        state.mode = action.payload.mode;
      }

      if (action.payload.sfx) {
        state.sfx = action.payload.sfx;
      }

      if (action.payload.music) {
        state.music = action.payload.music;
      }
    },
  },
});

export const {
  setTheme,
  setSfx,
  setMusic,
  toggleSfx,
  toggleMusic,
  toggleTheme,
  loadThemeSettings,
} = themeSlice.actions;

export default themeSlice.reducer;