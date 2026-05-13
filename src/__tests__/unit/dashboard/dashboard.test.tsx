import { screen } from "@testing-library/react";
import Dashboard from "@/app/dashboard/page";
import { renderWithProviders } from "@/__tests__/utils/test-utils";
import { vi } from "vitest";
import React from "react";

// 1. Mock Next.js Navigation (CRITICAL: Dashboard uses useRouter)
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// 2. Mock Lucide Icons (Comprehensive list from your source)
vi.mock("lucide-react", () => ({
  RefreshCcw: () => <div />,
  Loader2: () => <div />,
  HardDrive: () => <div />,
  Zap: () => <div />,
  Network: () => <div />,
  Database: () => <div />,
  Box: () => <div />,
  Clock: () => <div />,
}));

// 3. Mock Recharts
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <svg>{children}</svg>,
  Pie: () => <g />,
  Cell: () => <path />,
}));

// 4. Mock API Data
vi.mock("@/state/api", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useGetInventoryQuery: () => ({
      data: [{ id: 1, rack_uspace: 2, device_power: 100 }],
      isLoading: false,
      isFetching: false,
    }),
    useGetMyDetailsQuery: () => ({
      data: { uspace: 42, dcpower: 1000, nport: 10, sport: 10 },
      isLoading: false,
      isFetching: false,
    }),
  };
});

describe("Dashboard Page", () => {
  it("renders system utilization and gauges", () => {
    // We use your custom renderWithProviders here
    renderWithProviders(<Dashboard />);

    expect(screen.getByText(/System Utilization/i)).toBeInTheDocument();
    expect(screen.getByText(/Hardware Inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/Power Load/i)).toBeInTheDocument();
  });
});
