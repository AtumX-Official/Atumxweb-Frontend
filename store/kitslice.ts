import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface KitsState {
  kit: string;
  category: string | null;
}

const initialState: KitsState = {
  kit: "Default",
  category: null,
};

const kitsSlice = createSlice({
  name: "kits",
  initialState,
  reducers: {
    // Select kit ONLY
    setKit: (state, action: PayloadAction<string>) => {
      state.kit = action.payload;

      // Snowflake never has category
      if (action.payload === "snowflake") {
        state.category = null;
      }
    },

    // Select category ONLY (used for Subo / Cayo)
    setCategory: (state, action: PayloadAction<string | null>) => {
      // Allow category only for subo & cayo
      if (state.kit === "subo" || state.kit === "cayo") {
        state.category = action.payload;
      } else {
        state.category = null;
      }
    },

    // Optional helper: set both together
    setKitWithCategory: (
      state,
      action: PayloadAction<{ kit: string; category?: string }>
    ) => {
      state.kit = action.payload.kit;

      if (
        (action.payload.kit === "subo" ||
          action.payload.kit === "cayo") &&
        action.payload.category
      ) {
        state.category = action.payload.category;
      } else {
        state.category = null;
      }
    },
  },
});

export const { setKit, setCategory, setKitWithCategory } =
  kitsSlice.actions;
export default kitsSlice.reducer;
