import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Sidebar from "@/app/(components)/Sidebar/index";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import globalReducer from "@/state";

// Create a mock store
const mockStore = configureStore({
  reducer: { global: globalReducer },
});

describe("Sidebar Component", () => {
  // 1. Added 'async' to the test function
  it("should render the sidebar branding", async () => {
    render(
      <Provider store={mockStore}>
        <Sidebar />
      </Provider>
    );

    // 2. Wrap the expectation in 'waitFor'
    // This allows React to finish any internal state updates (silencing the 'act' warning)
    await waitFor(() => {
      const branding = screen.getByText(/DCIM/i);
      expect(branding).toBeInTheDocument();
    });
  });
});
