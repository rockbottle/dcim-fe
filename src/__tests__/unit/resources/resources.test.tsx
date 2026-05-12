import { screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import ResourcesPage from "@/app/Resources/page";
import { renderWithProviders } from "../../utils/test-utils";
import React from "react";

// 1. COMPREHENSIVE API MOCK (Including the missing 'api' export for Redux)
vi.mock("@/state/api", () => {
  return {
    api: {
      reducerPath: "api",
      reducer: (state = {}) => state,
      middleware: () => (next: any) => (action: any) => next(action),
    },
    useGetInventoryQuery: () => ({
      data: [
        {
          id: 1,
          device_hostname: "SRV-01",
          device_model: "Dell R740",
          device_power: 500,
          device_nports: 2,
          device_sports: 1,
          rack_uspace: 2,
        },
        {
          id: 2,
          device_hostname: "SRV-02",
          device_model: "HP DL380",
          device_power: 300,
          device_nports: 1,
          device_sports: 0,
          rack_uspace: 1,
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
      fulfilledTimeStamp: 1715356800000,
    }),
    useGetMyDetailsQuery: () => ({
      data: { dcpower: 2000, nport: 24, sport: 12, uspace: 42 },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
      fulfilledTimeStamp: 1715356800000,
    }),
    useUpdateUsageMutation: () => [
      vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) })),
      { isLoading: false },
    ],
    useCreateUsageMutation: () => [
      vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) })),
      { isLoading: false },
    ],
    useDeleteUsageMutation: () => [
      vi.fn(() => ({ unwrap: vi.fn().mockResolvedValue({}) })),
      { isLoading: false },
    ],
  };
});

// 2. NAV & REDUX MOCKS
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/resources",
}));

// Mock all lucide-react icons used in the Resources page
vi.mock("lucide-react", () => ({
  RefreshCw: () => <div />,
  ShoppingCart: () => <div />,
  Zap: () => <div />,
  Network: () => <div />,
  Box: () => <div />,
  HardDrive: () => <div />,
  ChevronLeft: () => <div />,
  Loader2: () => <div />,
  ArrowUpRight: () => <div />,
  Clock: () => <div />,
  Save: () => <div />,
  AlertTriangle: () => <div />,
  Trash2: () => <div />,
}));

// 3. RECHARTS MOCK
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Resources Page", () => {
  it("calculates and displays total consumption correctly", () => {
    renderWithProviders(<ResourcesPage />);

    // Total Power: 500 + 300 = 800. Purchased: 2,000
    // Total Ports (Net): 2 + 1 = 3. Purchased: 24
    // Components use .toLocaleString(), so regex accounts for formatting
    expect(screen.getByText(/800 \/ 2,000/i)).toBeInTheDocument();
    expect(screen.getByText(/3 \/ 24/i)).toBeInTheDocument();
  });

  it("switches to procurement view when Purchase is clicked", () => {
    renderWithProviders(<ResourcesPage />);

    const purchaseBtn = screen.getByRole("button", { name: /purchase/i });
    fireEvent.click(purchaseBtn);

    expect(screen.getByText(/Resource Procurement/i)).toBeInTheDocument();
    expect(screen.getByText(/Power \(Watts\)/i)).toBeInTheDocument();
  });

  it("disables the delete button if inventory is not empty", () => {
    renderWithProviders(<ResourcesPage />);

    const deleteBtn = screen.getByRole("button", {
      name: /delete usage record/i,
    });

    expect(deleteBtn).toBeDisabled();
    expect(
      screen.getByText(/must delete all 2 inventory items/i)
    ).toBeInTheDocument();
  });

  it("renders the top consumers table correctly with mock data", () => {
    renderWithProviders(<ResourcesPage />);

    expect(screen.getByText("SRV-01")).toBeInTheDocument();
    expect(screen.getByText("500W")).toBeInTheDocument();
    expect(screen.getByText("SRV-02")).toBeInTheDocument();
  });
});
