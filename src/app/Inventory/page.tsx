"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAppSelector } from "@/app/redux";
import { useSearchParams } from "next/navigation";
import {
  useGetInventoryQuery,
  useGetMyDetailsQuery,
  useDeleteInventoryMutation,
  useCreateInventoryMutation,
  useUpdateInventoryMutation,
} from "@/state/api";
import {
  Plus,
  Trash2,
  Edit,
  MoreHorizontal,
  X,
  Server,
  Building2,
  Save,
  AlertTriangle,
  Loader2,
  RefreshCcw,
  Info,
  Network,
  Zap,
  Clock,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import CreateInventoryModal from "../(components)/CreateInventoryModal";

// --- TYPES ---
interface Device {
  id: number;
  device_hostname: string;
  device_model: string;
  device_serial: string;
  device_type: string;
  rack_name: string;
  rack_unit: number;
  rack_uspace: number;
  device_power: number;
  device_nports: number;
  device_sports: number;
  power_status: boolean;
  device_status: boolean;
}

interface DcPurchase {
  uspace: number;
  dcpower: number;
  nport: number;
  sport: number;
}

interface FetchError {
  data?: {
    detail?: string;
    message?: string;
  };
}

// --- ENHANCED GAUGE COMPONENT ---
const InventoryGauge = ({
  title,
  value,
  max,
  color,
}: {
  title: string;
  value: number;
  max: number;
  color: string;
}) => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const safeMax = max > 0 ? max : 1;
  const percentage = Math.round((value / safeMax) * 100);
  const data = [{ value: value }, { value: Math.max(0, safeMax - value) }];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center shadow-md transition-all hover:shadow-lg">
      <span className="text-[11px] font-black text-gray-400 uppercase mb-4 tracking-[0.15em]">
        {title}
      </span>
      <div className="w-full h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius="75%"
              outerRadius="100%"
              dataKey="value"
              stroke="none"
              paddingAngle={0}
            >
              <Cell fill={color} />
              <Cell fill={isDarkMode ? "#1f2937" : "#f3f4f6"} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className="text-2xl font-black dark:text-white">
            {max > 0 ? `${percentage}%` : "0%"}
          </span>
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center">
        <span className="text-lg font-black dark:text-white leading-none">
          {value.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold text-gray-500 uppercase mt-1">
          Limit: {max > 0 ? max.toLocaleString() : "Loading..."}
        </span>
      </div>
    </div>
  );
};

const Inventory = () => {
  const searchParams = useSearchParams();
  const searchTarget = searchParams.get("search") || "";
  const [syncTime, setSyncTime] = useState<string>("");

  // API Hooks
  const {
    data: devices = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetInventoryQuery();
  const { data: myDetails, isLoading: isDetailsLoading } =
    useGetMyDetailsQuery();

  const [deleteDevice] = useDeleteInventoryMutation();
  const [createDevice, { isLoading: isCreating }] =
    useCreateInventoryMutation();
  const [updateDevice, { isLoading: isUpdating }] =
    useUpdateInventoryMutation();

  // UI State
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    deviceId: 0,
    deviceName: "",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Manual Sync Timestamp Logic
  useEffect(() => {
    if (!isFetching && !isLoading) {
      setSyncTime(new Date().toLocaleTimeString());
    }
  }, [isFetching, isLoading]);

  // Search Logic Integration
  const filteredInventory = useMemo(() => {
    return (devices as Device[]).filter(
      (device) =>
        device.device_hostname
          .toLowerCase()
          .includes(searchTarget.toLowerCase()) ||
        device.device_model.toLowerCase().includes(searchTarget.toLowerCase())
    );
  }, [devices, searchTarget]);

  // Calculated Resource Totals
  const totals = useMemo(
    () => ({
      assets: (devices as Device[]).reduce(
        (acc, d) => acc + (Number(d.rack_uspace) || 0),
        0
      ),
      power: (devices as Device[]).reduce(
        (acc, d) => acc + (Number(d.device_power) || 0),
        0
      ),
      nports: (devices as Device[]).reduce(
        (acc, d) => acc + (Number(d.device_nports) || 0),
        0
      ),
      sports: (devices as Device[]).reduce(
        (acc, d) => acc + (Number(d.device_sports) || 0),
        0
      ),
    }),
    [devices]
  );

  const limits = useMemo(() => {
    const d = myDetails as DcPurchase;
    return {
      assets: d?.uspace || 0,
      power: d?.dcpower || 0,
      nports: d?.nport || 0,
      sports: d?.sport || 0,
    };
  }, [myDetails]);

  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setOpenMenuId(null);
    };
    if (openMenuId !== null)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // --- CREATE LOGIC ---
  const handleCreateAsset = async (formData: Partial<Device>) => {
    setErrorMessage(null);
    try {
      await createDevice(formData as any).unwrap();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const fetchErr = err as FetchError;
      const errorDescription =
        fetchErr?.data?.detail ||
        fetchErr?.data?.message ||
        "Check backend connection";
      setErrorMessage(`Provisioning Failed: ${errorDescription}`);
      throw err;
    }
  };

  // --- UPDATE LOGIC ---
  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDevice) return;
    setErrorMessage(null);
    try {
      const cleanedData = {
        device_type: editingDevice.device_type,
        device_hostname: editingDevice.device_hostname,
        device_model: editingDevice.device_model,
        device_serial: editingDevice.device_serial,
        rack_name: editingDevice.rack_name,
        rack_unit: Number(editingDevice.rack_unit) || 1,
        rack_uspace: editingDevice.rack_uspace,
        device_power: editingDevice.device_power,
        device_nports: editingDevice.device_nports,
        device_sports: editingDevice.device_sports,
        power_status: editingDevice.power_status,
        device_status: editingDevice.device_status,
      };
      await updateDevice({ id: editingDevice.id, data: cleanedData }).unwrap();
      setIsUpdateModalOpen(false);
      setEditingDevice(null);
    } catch (err: unknown) {
      const fetchErr = err as FetchError;
      const errorDescription =
        fetchErr?.data?.detail ||
        fetchErr?.data?.message ||
        "Check backend connection";
      setErrorMessage(`Update Failed: ${errorDescription}`);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDevice(deleteModal.deviceId).unwrap();
      setDeleteModal({ isOpen: false, deviceId: 0, deviceName: "" });
    } catch (_err) {
      alert("Failed to delete device.");
    }
  };

  if (isLoading || isDetailsLoading)
    return (
      <div className="p-10 flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">
          Syncing Cloud Resources...
        </p>
      </div>
    );

  return (
    <div className="relative flex flex-col gap-8 pb-24 animate-in fade-in duration-500">
      {/* 1. DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-200 dark:border-gray-700 text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-black dark:text-white uppercase mb-2">
              Delete Asset?
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Confirm removal of{" "}
              <span className="font-bold">{deleteModal.deviceName}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setDeleteModal({ ...deleteModal, isOpen: false })
                }
                className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ENHANCED GAUGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryGauge
          title="Asset Capacity (U)"
          value={totals.assets}
          max={limits.assets}
          color="#3b82f6"
        />
        <InventoryGauge
          title="Power Load (W)"
          value={totals.power}
          max={limits.power}
          color="#ef4444"
        />
        <InventoryGauge
          title="Network Interfaces"
          value={totals.nports}
          max={limits.nports}
          color="#10b981"
        />
        <InventoryGauge
          title="Storage Fabric (SAN)"
          value={totals.sports}
          max={limits.sports}
          color="#f59e0b"
        />
      </div>

      {/* 3. ACTIONS HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 gap-4">
        <div>
          <h2 className="text-xl font-black dark:text-white uppercase tracking-tight leading-none">
            Device Inventory
          </h2>
          <div className="flex items-center gap-1.5 mt-2 text-gray-400 dark:text-gray-500">
            <Clock
              size={12}
              className={isFetching ? "animate-pulse text-blue-500" : ""}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {isFetching
                ? "Syncing..."
                : `Last Sync: ${syncTime || "Data Synchronized"}`}
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="group flex items-center gap-2 px-4 py-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700 transition-all"
          >
            <RefreshCcw
              size={18}
              className={
                isFetching
                  ? "animate-spin"
                  : "group-hover:rotate-180 transition-transform duration-500"
              }
            />
            <span className="text-[10px] font-bold uppercase">Refresh</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20 uppercase text-xs tracking-widest"
          >
            <Plus size={20} /> Add Asset
          </button>
        </div>
      </div>

      {/* 4. MAIN INVENTORY TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        {isFetching && !isLoading && (
          <div className="absolute inset-0 bg-white/40 dark:bg-gray-800/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30 text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">
                  Asset Identification
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                  Placement
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                  U-Space
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                  Network/SAN
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                  Power (W)
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredInventory.map((device) => (
                <tr
                  key={device.id}
                  className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500 group-hover:bg-blue-100 dark:group-hover:bg-blue-800 transition-colors">
                        <Server size={20} />
                      </div>
                      <div>
                        <div className="font-black text-gray-900 dark:text-white leading-tight">
                          {device.device_hostname}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono mt-1">
                          {device.device_model} • {device.device_serial}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/40 text-[#3e2723] dark:text-[#ffffff] rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-700/50 shadow-sm">
                      <Building2
                        size={12}
                        className="text-[#3e2723] dark:text-[#ffffff]"
                      />
                      {device.rack_name || "N/A"} (U{device.rack_unit})
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center font-bold dark:text-gray-300">
                    {device.rack_uspace}U
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-xs font-bold dark:text-white">
                      {device.device_nports} / {device.device_sports}
                    </div>
                    <div className="text-[9px] text-gray-400 uppercase font-black">
                      Eth / Fibre
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-orange-600 dark:text-orange-400 font-black">
                      {device.device_power}W
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex flex-col items-center gap-2">
                      {/* System/Network Status */}
                      <div className="flex items-center justify-center">
                        <div
                          className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
                            device.device_status
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-[10px] font-black uppercase dark:text-gray-400">
                          {device.device_status ? "Online" : "Offline"}
                        </span>
                      </div>

                      {/* Power Status Badge */}
                      <div
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-tighter ${
                          device.power_status
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                            : "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                        }`}
                      >
                        {device.power_status ? "⚡ Power On" : "🔌 No Power"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === device.id ? null : device.id
                        )
                      }
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-all"
                    >
                      <MoreHorizontal size={20} className="text-gray-400" />
                    </button>
                    {openMenuId === device.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-6 top-14 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] py-2"
                      >
                        <button
                          onClick={() => {
                            setEditingDevice(device);
                            setIsUpdateModalOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Edit size={16} className="text-blue-500" /> Update
                          Asset
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              deviceId: device.id,
                              deviceName: device.device_hostname,
                            })
                          }
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={16} /> Delete Asset
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateInventoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateAsset}
        isLoading={isCreating}
      />

      {isUpdateModalOpen && editingDevice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                Update Asset: {editingDevice.device_hostname}
              </h2>
              <button
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setErrorMessage(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateAsset}
              className="p-8 max-h-[75vh] overflow-y-auto"
            >
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-bold">{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2">
                  <Info size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    General Info
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Device Type
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white outline-none font-bold"
                    value={editingDevice.device_type}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        device_type: e.target.value,
                      })
                    }
                  >
                    <option>Server</option>
                    <option>Switch</option>
                    <option>Storage</option>
                    <option>Router</option>
                    <option>Firewall</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Hostname
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold outline-none"
                    value={editingDevice.device_hostname}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        device_hostname: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Model Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold outline-none"
                    value={editingDevice.device_model}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        device_model: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Serial Number
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-mono outline-none"
                    value={editingDevice.device_serial}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        device_serial: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2 mt-4">
                  <Building2 size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Rack Placement
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Rack Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold"
                    value={editingDevice.rack_name}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        rack_name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Rack Unit
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold"
                    value={editingDevice.rack_unit}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        rack_unit: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    U-Space Height
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold"
                    value={editingDevice.rack_uspace}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        rack_uspace: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2 mt-4">
                  <Network size={14} className="text-orange-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Connectivity & Specs
                  </span>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Network Ports
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold"
                    value={editingDevice.device_nports}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        device_nports: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    SAN Ports
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold"
                    value={editingDevice.device_sports}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        device_sports: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1">
                    Power Consumption (W)
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white font-bold"
                    value={editingDevice.device_power}
                    onChange={(e) =>
                      setEditingDevice({
                        ...editingDevice,
                        device_power: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2 mt-4">
                  <Zap size={14} className="text-yellow-500" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Operational State
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase block mb-0.5">
                      Power Supply
                    </span>
                    <span className="text-xs font-bold dark:text-white">
                      {editingDevice.power_status
                        ? "Redundant On"
                        : "Off / Disconnected"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingDevice({
                        ...editingDevice,
                        power_status: !editingDevice.power_status,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingDevice.power_status ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`${editingDevice.power_status ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase block mb-0.5">
                      Network Status
                    </span>
                    <span className="text-xs font-bold dark:text-white">
                      {editingDevice.device_status
                        ? "Active / Online"
                        : "Maintenance Mode"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingDevice({
                        ...editingDevice,
                        device_status: !editingDevice.device_status,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${editingDevice.device_status ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`${editingDevice.device_status ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-12">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setErrorMessage(null);
                  }}
                  className="flex-1 py-4 border dark:border-gray-700 rounded-xl font-bold dark:text-gray-300 transition-all hover:bg-gray-50"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-4 bg-[#3e2723] text-white rounded-xl font-black shadow-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Save size={20} /> Save Asset Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
