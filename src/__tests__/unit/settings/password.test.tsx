import { screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import PasswordPage from "@/app/Settings/Password/page";
import { renderWithProviders } from "../../utils/test-utils";
import React from "react";

// Mock icons
vi.mock("lucide-react", () => ({
  Lock: () => <div />,
  Eye: () => <div />,
  EyeOff: () => <div />,
  ShieldCheck: () => <div />,
  AlertCircle: () => <div />,
}));

afterEach(() => {
  cleanup();
});

describe("Password Security Page (Alternative Strategy)", () => {
  // Helper to get inputs by their display order
  const getInputs = (container: HTMLElement) => {
    const inputs = container.querySelectorAll("input");
    return {
      currentInput: inputs[0],
      newPasswordInput: inputs[1],
      confirmInput: inputs[2],
    };
  };

  it("renders the security header and submit button", () => {
    renderWithProviders(<PasswordPage />);
    expect(screen.getByText(/Security/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Update Password/i })
    ).toBeInTheDocument();
  });

  it("shows an error if passwords do not match", () => {
    const { container } = renderWithProviders(<PasswordPage />);
    const { currentInput, newPasswordInput, confirmInput } =
      getInputs(container);
    const submitBtn = screen.getByRole("button", { name: /Update Password/i });

    fireEvent.change(currentInput, { target: { value: "old-password123" } });
    fireEvent.change(newPasswordInput, {
      target: { value: "new-password123" },
    });
    fireEvent.change(confirmInput, { target: { value: "wrong-match" } });

    fireEvent.click(submitBtn);

    // Using queryByText to avoid throwing immediately if missing,
    // helps in debugging if the component uses different phrasing
    expect(screen.getByText(/do not match/i)).toBeInTheDocument();
  });

  it("validates password length correctly", () => {
    const { container } = renderWithProviders(<PasswordPage />);
    const { newPasswordInput, confirmInput } = getInputs(container);
    const submitBtn = screen.getByRole("button", { name: /Update Password/i });

    // Try a very short password
    fireEvent.change(newPasswordInput, { target: { value: "123" } });
    fireEvent.change(confirmInput, { target: { value: "123" } });

    fireEvent.click(submitBtn);

    // The log showed the error message didn't appear.
    // If the component requires all fields to be filled before validating:
    const { currentInput } = getInputs(container);
    fireEvent.change(currentInput, { target: { value: "some-old-pass" } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/8 characters/i)).toBeInTheDocument();
  });

  it("shows success message and clears form on valid submission", () => {
    const { container } = renderWithProviders(<PasswordPage />);
    const { currentInput, newPasswordInput, confirmInput } =
      getInputs(container);
    const submitBtn = screen.getByRole("button", { name: /Update Password/i });

    fireEvent.change(currentInput, { target: { value: "old-password123" } });
    fireEvent.change(newPasswordInput, {
      target: { value: "brand-new-password" },
    });
    fireEvent.change(confirmInput, { target: { value: "brand-new-password" } });

    fireEvent.click(submitBtn);

    expect(screen.getByText(/successfully/i)).toBeInTheDocument();
    expect((currentInput as HTMLInputElement).value).toBe("");
  });

  it("toggles password visibility when eye icon is clicked", () => {
    const { container } = renderWithProviders(<PasswordPage />);
    const { newPasswordInput } = getInputs(container);

    // Selecting by index based on your component's button order
    const buttons = screen.getAllByRole("button");
    const toggleBtn = buttons[1];

    expect(newPasswordInput.type).toBe("password");
    fireEvent.click(toggleBtn);
    expect(newPasswordInput.type).toBe("text");
    fireEvent.click(toggleBtn);
    expect(newPasswordInput.type).toBe("password");
  });
});
