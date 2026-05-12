import React, { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { setupStore } from "@/app/redux"; // Ensure you have a setupStore function

export function renderWithProviders(ui: ReactElement) {
  const store = setupStore();
  return {
    store,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}
