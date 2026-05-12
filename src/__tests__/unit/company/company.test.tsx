import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Company from "@/app/Company/page";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/state/api";

// 1. Comprehensive Mock with .unwrap() support
vi.mock("@/state/api", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useGetMyTeamQuery: vi.fn(() => ({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    })),
    useCreateUserMutation: vi.fn(() => {
      // The trigger function must return something that looks like a Promise
      // but also has an .unwrap() method for RTK Query patterns.
      const trigger = vi.fn().mockImplementation(() => {
        const promise = Promise.resolve({ data: { success: true } });
        (promise as any).unwrap = () => Promise.resolve({ success: true });
        return promise;
      });
      return [trigger, { isLoading: false }];
    }),
  };
});

const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

describe("Company Component", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.clearAllMocks();
  });

  it("should open and close the 'Add User' modal using the X button", async () => {
    const user = userEvent.setup();
    render(<Company />, { wrapper });

    const addButton = await screen.findByRole("button", { name: /add user/i });
    await user.click(addButton);

    expect(screen.getByText(/Create New User/i)).toBeInTheDocument();

    const closeIcon = screen.getByTestId("close-icon");
    await user.click(closeIcon);

    await waitFor(() => {
      expect(screen.queryByText(/Create New User/i)).not.toBeInTheDocument();
    });
  });

  it("should close the modal after a successful user registration", async () => {
    const user = userEvent.setup();
    render(<Company />, { wrapper });

    // Open Modal
    const addButton = await screen.findByRole("button", { name: /add user/i });
    await user.click(addButton);

    // Fill Form
    await user.type(screen.getByPlaceholderText("johndoe"), "testuser");
    await user.type(
      screen.getByPlaceholderText("john@company.com"),
      "test@test.com"
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "password123");

    // Click Submit
    const submitBtn = screen.getByRole("button", {
      name: /register new member/i,
    });
    await user.click(submitBtn);

    // Verify Modal is gone
    await waitFor(
      () => {
        // Use queryByText so it returns null (success) instead of throwing an error immediately
        const modalTitle = screen.queryByText(/Create New User/i);
        expect(modalTitle).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});
