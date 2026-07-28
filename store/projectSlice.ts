import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProjectState {
  projectName: string | null
  projectPath: string | null
}

const initialState: ProjectState = {
  projectName: null,
  projectPath: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setName(state, action: PayloadAction<string | null>) {
      state.projectName = action.payload;
    },
    setPath(state, action: PayloadAction<string | null>) {
      state.projectPath = action.payload;
    },
  },
});

export const { setName, setPath } =
  projectSlice.actions;
export default projectSlice.reducer;
