import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InitialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  searchTerm: string;
}

const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  searchTerm: "",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setSearchTerm: (state, action) => { // Add this reducer
      state.searchTerm = action.payload;
    },
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode, setSearchTerm } = globalSlice.actions;

export default globalSlice.reducer;
