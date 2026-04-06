import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* --- INTERFACES --- */
export interface Device {
  id: number;
  device_type: string;
  device_hostname: string;
  device_model: string;
  device_serial: string;
  rack_name: string;
  rack_unit: number;
  rack_uspace: number;
  device_power: number;
  device_nports: number;
  device_sports: number;
  power_status: boolean;
  device_status: boolean;
}

export type NewDevice = Omit<Device, "id">;

export interface DcPurchase {
  id?: number;
  dcpower: number;
  uspace: number;
  nport: number;
  sport: number;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  company_name: string;
  password?: string;
}

/* --- BASE API CONFIG --- */
const baseQuery = fetchBaseQuery({
  /**
   * By using "/api", the browser sends requests to the Frontend pod.
   * The Frontend pod (via src/app/api/[...args]/route.ts) then
   * forwards the request to http://dcim-be:8000 internally.
   */
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  prepareHeaders: (headers) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  baseQuery,
  reducerPath: "api",
  tagTypes: ["Inventory", "User", "Usage"],
  endpoints: (build) => ({
    /* --- AUTH --- */
    login: build.mutation({
      query: (credentials) => {
        const formData = new URLSearchParams();
        formData.append("username", credentials.username);
        formData.append("password", credentials.password);
        return {
          url: "/token",
          method: "POST",
          body: formData,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        };
      },
    }),

    /* --- INVENTORY --- */
    getInventory: build.query<Device[], void | undefined>({
      query: () => "/inventory/my_details",
      providesTags: ["Inventory"],
    }),
    createInventory: build.mutation<Device, NewDevice>({
      query: (newDevice) => ({
        url: "/inventory/create",
        method: "POST",
        body: newDevice,
      }),
      invalidatesTags: ["Inventory"],
    }),
    updateInventory: build.mutation<
      { message: string },
      { id: number; data: Partial<Device> }
    >({
      query: ({ id, data }) => ({
        url: `/inventory/update/?id=${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Inventory"],
    }),
    deleteInventory: build.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/inventory/delete?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Inventory"],
    }),

    /* --- USAGE --- */
    getMyDetails: build.query<DcPurchase, void | undefined>({
      query: () => "/usage/my_details",
      providesTags: ["Usage"],
    }),
    createUsage: build.mutation<DcPurchase, DcPurchase>({
      query: (newUsage) => ({
        url: "/usage/create",
        method: "POST",
        body: newUsage,
      }),
      invalidatesTags: ["Usage", "Inventory"],
    }),
    updateUsage: build.mutation<DcPurchase, Partial<DcPurchase>>({
      query: (data) => ({
        url: "/usage/update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Usage", "Inventory"],
    }),

    // Add this to your injectEndpoints in api.tsx
    deleteUsage: build.mutation<{ message: string }, void>({
      query: () => ({
        url: `/usage/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Inventory", "Usage"],
    }),

    /* --- USER --- */
    getCurrentUser: build.query<User, void | undefined>({
      query: () => "/user/my_details",
      providesTags: ["User"],
    }),
    createUser: build.mutation<User, User>({
      query: (newUser) => ({
        url: "/user/create",
        method: "POST",
        body: newUser,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: build.mutation<{ message: string }, Partial<User>>({
      query: (data) => ({
        url: "/user/update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: build.mutation<{ message: string }, number | void>({
      query: () => ({
        url: `/user/delete`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
    getMyTeam: build.query<User[], void | undefined>({
      query: () => "/user/my_team",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useGetInventoryQuery,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
  useDeleteInventoryMutation,
  useGetMyDetailsQuery,
  useCreateUsageMutation,
  useUpdateUsageMutation,
  useDeleteUsageMutation,
  useGetCurrentUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetMyTeamQuery,
} = api;
