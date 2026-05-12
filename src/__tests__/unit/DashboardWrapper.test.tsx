import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DashboardWrapper from "@/app/DashboardWrapper";
import { usePathname, useRouter } from "next/navigation";

// 1. Mock Next.js Navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(),
}));

describe("DashboardWrapper Auth Guard", () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (usePathname as any).mockReturnValue("/dashboard");

    // Clear localStorage before each test
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
      writable: true,
    });
  });

  it("redirects to Login when no token is present", async () => {
    // Simulate no token
    (window.localStorage.getItem as any).mockReturnValue(null);

    render(
      <DashboardWrapper>
        <div data-testid="protected-content">Secret Dashboard</div>
      </DashboardWrapper>
    );

    // Wait for the useEffect to trigger the redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/Login");
    });
  });

  it("renders children when token is present", async () => {
    // Simulate active token
    (window.localStorage.getItem as any).mockReturnValue("valid-token");

    render(
      <DashboardWrapper>
        <div data-testid="protected-content">Secret Dashboard</div>
      </DashboardWrapper>
    );

    const content = await screen.findByTestId("protected-content");
    expect(content).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
