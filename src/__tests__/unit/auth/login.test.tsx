import { screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Login from "@/app/Login/page";
import { renderWithProviders } from "../../utils/test-utils";

describe("Login Page", () => {
  it("should render login fields and handle submission", async () => {
    renderWithProviders(<Login />);

    // 1. Check for UI elements (Using flexible regex for placeholders)
    const userField = screen.getByPlaceholderText(/username|email/i);
    const passField = screen.getByPlaceholderText("••••••••");
    const loginButton = screen.getByRole("button", {
      name: /initialize session/i,
    });

    // 2. Simulate User Input
    fireEvent.change(userField, { target: { value: "admin" } });
    fireEvent.change(passField, { target: { value: "password123" } });

    // 3. Click Login
    fireEvent.click(loginButton);

    // 4. Verify Behavior
    await waitFor(() => {
      // In many DCIM apps, the button disables during the 'pending' state
      expect(loginButton).toBeDisabled();
    });
  });
});
