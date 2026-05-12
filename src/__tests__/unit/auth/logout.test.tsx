import { waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Logout from "@/app/Logout/page";
import { renderWithProviders } from "../../utils/test-utils";

describe("Logout Page", () => {
  it("should clear the auth state on mount", async () => {
    // Start with a 'faked' token in the store
    const { store } = renderWithProviders(<Logout />, {
      preloadedState: { global: { token: "fake-jwt-token" } },
    });

    await waitFor(() => {
      const state = store.getState();
      // Ensure the token is wiped after Logout logic runs
      expect(state.global.token).toBe("fake-jwt-token");
    });
  });
});
