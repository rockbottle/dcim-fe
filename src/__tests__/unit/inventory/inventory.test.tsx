import { screen, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import Inventory from "@/app/Inventory/page";
import { renderWithProviders } from "../../utils/test-utils";
import React from "react";

// 1. CONSOLIDATED API MOCK
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
          id: "1",
          device_hostname: "Switch-A1",
          device_model: "Catalyst-9300",
          category: "Networking",
          status: "Active",
          location: "Rack-01",
        },
      ],
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }),
    useGetMyDetailsQuery: () => ({
      data: { uspace: 42, dcpower: 1000 },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    }),
    useDeleteInventoryMutation: () => [vi.fn(), { isLoading: false }],
    useCreateInventoryMutation: () => [vi.fn(), { isLoading: false }],
    useUpdateInventoryMutation: () => [vi.fn(), { isLoading: false }],
  };
});

// 2. BROWSER ENVIRONMENT MOCKS
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 3. MOCK UI COMPONENTS
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: ({ rows }: any) => (
    <div data-testid="datagrid">
      {rows?.map((row: any) => (
        <div key={row.id}>{row.device_hostname}</div>
      ))}
    </div>
  ),
  GridToolbar: () => <div />,
}));

// 4. MOCK NAVIGATION
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/inventory",
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// 5. EXPLICIT ICON MOCK
vi.mock("lucide-react", () => ({
  PlusCircle: () => <div />,
  Plus: () => <div />,
  Search: () => <div />,
  RefreshCcw: () => <div />,
  Loader2: () => <div />,
  Clock: () => <div />,
  Server: () => <div />,
  Building2: () => <div />,
  Database: () => <div />,
  Layout: () => <div />,
  AlertCircle: () => <div />,
  ChevronRight: () => <div />,
  ChevronDown: () => <div />,
  Edit: () => <div />,
  Trash2: () => <div />,
  Box: () => <div />,
  Cpu: () => <div />,
  Zap: () => <div />,
  MapPin: () => <div />,
  MoreHorizontal: () => <div />, // Fixed latest crash
  Filter: () => <div />,
  Download: () => <div />,
  X: () => <div />,
  Check: () => <div />,
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Inventory Page", () => {
  it("should render the inventory table and data", async () => {
    renderWithProviders(<Inventory />);

    await waitFor(
      () => {
        expect(screen.getByText(/Switch-A1/i)).toBeInTheDocument();
        expect(screen.getByText(/Inventory/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("should display the 'Create' button", () => {
    renderWithProviders(<Inventory />);
    const button = screen.getByRole("button", { name: /Add Asset/i });
    expect(button).toBeInTheDocument();
  });
});
