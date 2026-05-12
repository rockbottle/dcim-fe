"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/app/redux";
import {
  useGetInventoryQuery,
  useGetMyDetailsQuery,
  useUpdateUsageMutation,
  useCreateUsageMutation,
  useDeleteUsageMutation,
} from "@/state/api";
import {
  RefreshCw,
  ShoppingCart,
  Zap,
  Network,
  Box,
  HardDrive,
  ChevronLeft,
  Loader2,
  ArrowUpRight,
  Clock,
  Save,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// --- TYPES ---
interface Device {
  id: number;
  device_hostname: string;
  device_model: string;
  device_power: number;
  device_nports: number;
  device_sports: number;
  rack_uspace: number;
}

interface FetchError {
  status?: number;
  data?: {
    detail?: string;
  };
}

const ResourceGauge = ({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(100, Math.round((value / safeTotal) * 100));
  const data = [{ value: value }, { value: Math.max(0, safeTotal - value) }];

  return (
    <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 w-full">
      <div className="h-32 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
              dataKey="value"
              stroke="none"
            >
              <Cell fill={percentage > 90 ? "#EF4444" : color} />
              <Cell fill={isDarkMode ? "#374151" : "#e5e7eb"} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span
            className={`text-2xl font-black ${percentage > 90 ? "text-red-500" : "dark:text-white"}`}
          >
            {percentage}%
          </span>
        </div>
      </div>
      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 mt-4 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-black dark:text-gray-200 mt-1">
        {value.toLocaleString()} / {total.toLocaleString()}
      </p>
    </div>
  );
};

export default function ResourcesPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "purchase">(
    "dashboard"
  );
  const [formData, setFormData] = useState({
    dcpower: 1,
    nport: 1,
    uspace: 1,
    sport: 1,
  });
  const [syncTime, setSyncTime] = useState<string>("");

  const {
    data: devices,
    isLoading: isInvLoading,
    isFetching: isInvFetching,
    refetch: refetchInv,
    fulfilledTimeStamp: invTimestamp,
  } = useGetInventoryQuery();

  const {
    data: myDetails,
    isLoading: isDetLoading,
    isFetching: isDetFetching,
    refetch: refetchDetails,
    error: detailsError,
    fulfilledTimeStamp: detTimestamp,
  } = useGetMyDetailsQuery();

  const [deleteUsage, { isLoading: isDeletingUsage }] =
    useDeleteUsageMutation();
  const [updateUsage, { isLoading: isUpdating }] = useUpdateUsageMutation();
  const [createUsage, { isLoading: isCreating }] = useCreateUsageMutation();

  const isRefreshing = isInvFetching || isDetFetching;
  const isActionLoading = isUpdating || isCreating;

  useEffect(() => {
    const latest = Math.max(invTimestamp || 0, detTimestamp || 0);
    if (latest > 0) setSyncTime(new Date(latest).toLocaleTimeString());
  }, [invTimestamp, detTimestamp]);

  const metrics = useMemo(
    () => ({
      consumed: {
        power:
          devices?.reduce(
            (acc: number, d: Device) => acc + (d.device_power || 0),
            0
          ) ?? 0,
        nport:
          devices?.reduce(
            (acc: number, d: Device) => acc + (d.device_nports || 0),
            0
          ) ?? 0,
        sport:
          devices?.reduce(
            (acc: number, d: Device) => acc + (d.device_sports || 0),
            0
          ) ?? 0,
        uspace:
          devices?.reduce(
            (acc: number, d: Device) => acc + (Number(d.rack_uspace) || 0),
            0
          ) ?? 0,
      },
      purchased: {
        power: myDetails?.dcpower || 0,
        nport: myDetails?.nport || 0,
        sport: myDetails?.sport || 0,
        uspace: myDetails?.uspace || 0,
      },
    }),
    [devices, myDetails]
  );

  const handleCleanup = async () => {
    if (
      window.confirm(
        "WARNING: This will permanently delete your company usage record. This action cannot be undone. Proceed?"
      )
    ) {
      try {
        await deleteUsage().unwrap();
        alert("Usage records successfully cleared.");
        refetchDetails();
      } catch (err: any) {
        alert(
          `Backend Error: ${err?.data?.detail || "Failed to delete usage record"}`
        );
      }
    }
  };

  const handleConfirmPurchase = async () => {
    try {
      const errorData = detailsError as FetchError;
      const isNewUser = !myDetails || errorData?.status === 404;
      const payload = {
        dcpower: Math.round(metrics.purchased.power + formData.dcpower),
        nport: Math.round(metrics.purchased.nport + formData.nport),
        uspace: Math.round(metrics.purchased.uspace + formData.uspace),
        sport: Math.round(metrics.purchased.sport + formData.sport),
      };
      if (isNewUser) await createUsage(payload).unwrap();
      else await updateUsage(payload).unwrap();
      setFormData({ dcpower: 1, nport: 1, uspace: 1, sport: 1 });
      setCurrentView("dashboard");
      refetchDetails();
    } catch (error) {
      console.error("Procurement failed:", error);
    }
  };

  const topConsumers = useMemo(() => {
    return ([...(devices ?? [])] as Device[])
      .sort((a, b) => (b.device_power || 0) - (a.device_power || 0))
      .slice(0, 5);
  }, [devices]);

  if (isInvLoading || isDetLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Syncing Infrastructure...
        </h2>
      </div>
    );

  if (currentView === "purchase") {
    return (
      <div className="flex flex-col gap-6 pb-20 animate-in fade-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView("dashboard")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-white transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">
              Resource Procurement
            </h1>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProcurementInput
                label="Power (Watts)"
                value={formData.dcpower}
                icon={<Zap className="text-orange-500" size={16} />}
                onChange={(v: number) =>
                  setFormData((p) => ({ ...p, dcpower: v }))
                }
              />
              <ProcurementInput
                label="Network Ports"
                value={formData.nport}
                icon={<Network className="text-blue-500" size={16} />}
                onChange={(v: number) =>
                  setFormData((p) => ({ ...p, nport: v }))
                }
              />
              <ProcurementInput
                label="Rack Units (U)"
                value={formData.uspace}
                icon={<Box className="text-emerald-500" size={16} />}
                onChange={(v: number) =>
                  setFormData((p) => ({ ...p, uspace: v }))
                }
              />
              <ProcurementInput
                label="SAN Ports"
                value={formData.sport}
                icon={<HardDrive className="text-purple-500" size={16} />}
                onChange={(v: number) =>
                  setFormData((p) => ({ ...p, sport: v }))
                }
              />
            </div>
          </div>
          <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl flex flex-col justify-between border border-gray-800">
            <div>
              <h3 className="text-xs font-black uppercase text-blue-400 tracking-widest mb-8">
                Request Summary
              </h3>
              <div className="space-y-6">
                <SummaryRow
                  label="Projected Power"
                  value={`${metrics.purchased.power + formData.dcpower} W`}
                />
                <SummaryRow
                  label="Projected Ports"
                  value={
                    metrics.purchased.nport +
                    formData.nport +
                    metrics.purchased.sport +
                    formData.sport
                  }
                />
                <SummaryRow
                  label="Projected Rack"
                  value={`${metrics.purchased.uspace + formData.uspace} U`}
                />
              </div>
            </div>
            <button
              onClick={handleConfirmPurchase}
              disabled={isActionLoading}
              className="mt-12 w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isActionLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}{" "}
              Confirm Allocation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in">
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">
            Resource Center
          </h1>
          <div className="flex items-center gap-1.5">
            <Clock
              size={12}
              className={
                isRefreshing ? "animate-pulse text-blue-500" : "text-gray-400"
              }
            />
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              Last Refreshed: {syncTime || "Syncing..."}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              refetchInv();
              refetchDetails();
            }}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest disabled:opacity-50 transition-all"
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
            />{" "}
            Sync
          </button>
          <button
            onClick={() => setCurrentView("purchase")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black shadow-lg uppercase text-xs tracking-widest transition-all active:scale-95"
          >
            <ShoppingCart size={18} /> Purchase
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResourceGauge
          label="Power Usage"
          value={metrics.consumed.power}
          total={metrics.purchased.power}
          color="#EF4444"
        />
        <ResourceGauge
          label="Network Ports"
          value={metrics.consumed.nport}
          total={metrics.purchased.nport}
          color="#3B82F6"
        />
        <ResourceGauge
          label="SAN Connectivity"
          value={metrics.consumed.sport}
          total={metrics.purchased.sport}
          color="#8B5CF6"
        />
        <ResourceGauge
          label="Rack Capacity"
          value={metrics.consumed.uspace}
          total={metrics.purchased.uspace}
          color="#10B981"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            Top Consumption Assets
          </h4>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500">
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-50 dark:border-gray-700 text-left">
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase w-12">
                  #
                </th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase">
                  Asset
                </th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase text-center">
                  Power
                </th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase text-center">
                  Ports
                </th>
                <th className="pb-4 text-[10px] font-black text-gray-400 uppercase text-right">
                  U-Space
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {topConsumers.map((device, idx) => (
                <tr
                  key={device.id}
                  className="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all"
                >
                  <td className="py-5 text-[10px] font-black text-gray-300">
                    {(idx + 1).toString().padStart(2, "0")}
                  </td>
                  <td className="py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black dark:text-white uppercase leading-none">
                        {device.device_hostname}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase mt-1">
                        {device.device_model}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 text-center">
                    <span className="px-3 py-1 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-600 text-xs font-black">
                      {device.device_power}W
                    </span>
                  </td>
                  <td className="py-5 text-center text-sm font-black dark:text-gray-200">
                    {device.device_nports}{" "}
                    <span className="text-[9px] text-gray-400 font-bold">
                      NET
                    </span>
                  </td>
                  <td className="py-5 text-right text-sm font-black dark:text-gray-200">
                    {device.rack_uspace}{" "}
                    <span className="text-[9px] text-gray-400 font-bold italic">
                      UNITS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-12 p-8 bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-3xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
          <h3 className="text-lg font-black text-red-600 uppercase tracking-tight">
            Danger Zone
          </h3>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm font-black dark:text-white uppercase">
              Reset Company Usage
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              To delete your account, you must first clear all inventory and
              usage records.
            </p>
          </div>
          <button
            onClick={handleCleanup}
            disabled={isDeletingUsage || (devices?.length ?? 0) > 0}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg ${
              (devices?.length ?? 0) > 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-red-600 text-white hover:bg-red-700 shadow-red-500/20 active:scale-95"
            }`}
          >
            {isDeletingUsage ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}{" "}
            Delete Usage Record
          </button>
        </div>
        {(devices?.length ?? 0) > 0 && (
          <p className="mt-4 text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
            Note: You must delete all {devices?.length} inventory items before
            clearing usage.
          </p>
        )}
      </div>
    </div>
  );
}

const ProcurementInput = ({ label, value, icon, onChange }: any) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
      {icon} {label}
    </label>
    <input
      type="number"
      min="1"
      value={value}
      onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
      className="w-full p-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-black text-lg outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
    />
  </div>
);

const SummaryRow = ({ label, value }: any) => (
  <div className="flex justify-between items-center border-b border-gray-800 pb-4">
    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
      {label}
    </span>
    <span className="font-black text-lg">{value}</span>
  </div>
);
