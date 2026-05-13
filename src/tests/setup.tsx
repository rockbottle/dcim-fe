import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

/**
 * 1. THE NUCLEAR FIX: Request/URL Constructor Alignment
 * This forces relative URLs to be absolute so Node/Undici doesn't crash.
 * It also fixes the URLSearchParams 'instanceof' mismatch.
 */
const NativeRequest = global.Request;
global.Request = class Request extends NativeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    let finalInput = input;

    // Resolve relative URLs to localhost for the Node environment
    if (typeof input === "string" && input.startsWith("/")) {
      finalInput = `http://localhost:3000${input}`;
    } else if (input instanceof URL && input.href.startsWith("/")) {
      finalInput = new URL(input.href, "http://localhost:3000");
    }

    // Handle URLSearchParams 'instanceof' mismatch before Node rejects it
    if (init?.body && typeof init.body === "object") {
      if (
        init.body.toString() === "[object URLSearchParams]" ||
        "append" in init.body
      ) {
        init.body = init.body.toString();
      }
    }

    super(finalInput, init);
  }
} as typeof NativeRequest;

// Align global constructors and JSDOM location
if (typeof window !== "undefined") {
  Object.defineProperty(window, "location", {
    value: new URL("http://localhost:3000"),
    writable: true,
  });
  global.URLSearchParams = window.URLSearchParams;
  global.URL = window.URL;
}

/**
 * 2. Unified Mock Global Fetch
 */
global.fetch = vi.fn(
  async (url: string | URL | Request, options?: RequestInit) => {
    let urlString = "";

    if (url instanceof Request) {
      urlString = url.url;
    } else {
      urlString = url.toString();
    }

    // Ensure we are matching against absolute URLs in our logic below
    if (urlString.startsWith("/")) {
      urlString = `http://localhost:3000${urlString}`;
    }

    let data: Record<string, unknown> | unknown[] = {};

    // --- API ROUTING LOGIC ---
    if (urlString.includes("/api/health")) {
      data = { status: "UP", version: "1.0.0" };
    } else if (
      urlString.includes("/api/token") ||
      urlString.includes("/login")
    ) {
      data = { access: "mock_token", refresh: "mock_refresh" };
    } else if (urlString.includes("/inventory")) {
      if (options?.method === "POST") {
        data = { message: "Device created successfully" };
      } else if (options?.method === "DELETE") {
        data = { message: "Device deleted" };
      } else {
        data = [];
      }
    } else if (
      urlString.includes("getCurrentUser") ||
      urlString.includes("/users/me") ||
      urlString.includes("/user/my_details")
    ) {
      data = { id: "user_123", username: "admin", email: "admin@dcim.local" };
    } else if (
      urlString.includes("getMyDetails") ||
      urlString.includes("/details") ||
      urlString.includes("/usage/my_details")
    ) {
      data = { firstName: "Admin", lastName: "User", role: "Superuser" };
    }

    return {
      ok: true,
      status: 200,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: async () => data,
      text: async () => JSON.stringify(data),
      clone: function () {
        return { ...this };
      },
    } as Response;
  }
) as unknown as typeof fetch;

/**
 * 3. Mock Next.js Navigation
 */
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => ({
    get: vi.fn((_key: string) => null),
  }),
}));

/**
 * 4. Mock Recharts ResponsiveContainer
 */
vi.mock("recharts", async () => {
  const OriginalModule = (await vi.importActual("recharts")) as Record<
    string,
    unknown
  >;
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: "800px", height: "800px" }}>{children}</div>
    ),
  };
});
