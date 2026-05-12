import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "@/state"; // Matches your redux.tsx
import { api } from "@/state/api"; // Matches your redux.tsx

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: Partial<any>;
  store?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    // We use combineReducers to match your rootReducer in redux.tsx
    store = configureStore({
      reducer: {
        global: globalReducer,
        [api.reducerPath]: api.reducer,
      },
      middleware: (getDefault) =>
        getDefault({
          serializableCheck: false, // Prevents warnings with mock data
        }).concat(api.middleware),
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }): ReactElement {
    return <Provider store={store}>{children}</Provider>;
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
