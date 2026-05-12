import { screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Profile from "@/app/Profile/page";
import { renderWithProviders } from "../../utils/test-utils";

describe("Profile Page", () => {
  it("should display the user details from the mock API", async () => {
    renderWithProviders(<Profile />);

    await waitFor(() => {
      // These strings match the data we defined in setup.tsx
      expect(
        screen.getByDisplayValue(/pramod@example.com/i)
      ).toBeInTheDocument();
    });
  });
});
