"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Loader2,
  Info,
  Building2,
  Network,
  Zap,
  AlertCircle,
} from "lucide-react";

// --- TYPES & INTERFACES ---
interface InventoryFormData {
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

interface FastAPIError {
  data?: {
    detail?: string;
  };
}

type CreateInventoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: InventoryFormData) => Promise<void>;
  isLoading: boolean;
};

// --- FIX: Move outside component to solve useEffect dependency error ---
const initialFormState: InventoryFormData = {
  device_type: "Server",
  device_hostname: "",
  device_model: "",
  device_serial: "",
  rack_name: "",
  rack_unit: 1,
  rack_uspace: 1,
  device_power: 0,
  device_nports: 0,
  device_sports: 0,
  power_status: true,
  device_status: true,
};

const CreateInventoryModal = ({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateInventoryModalProps) => {
  const [formData, setFormData] = useState<InventoryFormData>(initialFormState);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setErrorMsg(null);
      setFormData(initialFormState);
    }
  }, [isOpen]); // initialFormState is now stable because it's outside the function

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await onCreate(formData);
      setFormData(initialFormState);
    } catch (err: unknown) {
      // FIX: Cast to FastAPIError instead of 'any' to satisfy ESLint
      const errorData = err as FastAPIError;
      const detailedError =
        errorData?.data?.detail || "An unexpected provisioning error occurred.";
      setErrorMsg(detailedError);
    }
  };

  const inputStyles =
    "w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm transition-all";
  const labelStyles =
    "text-[10px] font-black text-gray-500 uppercase block mb-1.5 ml-1 tracking-widest";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
            Provision New Asset
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full dark:text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 max-h-[75vh] overflow-y-auto"
        >
          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-black text-red-800 dark:text-red-400 uppercase tracking-tight">
                  Provisioning Denied
                </h3>
                <p className="text-xs font-bold text-red-700 dark:text-red-300/80 mt-0.5">
                  {errorMsg}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SECTION: GENERAL */}
            <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2">
              <Info size={14} className="text-blue-500" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                General Info
              </span>
            </div>

            <div>
              <label className={labelStyles}>Device Type</label>
              <select
                className={inputStyles}
                value={formData.device_type}
                onChange={(e) =>
                  setFormData({ ...formData, device_type: e.target.value })
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
              <label className={labelStyles}>Hostname</label>
              <input
                required
                type="text"
                className={inputStyles}
                placeholder="e.g. DC1-SRV-01"
                value={formData.device_hostname}
                onChange={(e) =>
                  setFormData({ ...formData, device_hostname: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelStyles}>Model Name</label>
              <input
                required
                type="text"
                className={inputStyles}
                placeholder="e.g. Dell R740"
                value={formData.device_model}
                onChange={(e) =>
                  setFormData({ ...formData, device_model: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelStyles}>Serial Number</label>
              <input
                required
                type="text"
                className={`${inputStyles} font-mono`}
                placeholder="SN-123456"
                value={formData.device_serial}
                onChange={(e) =>
                  setFormData({ ...formData, device_serial: e.target.value })
                }
              />
            </div>

            {/* SECTION: PLACEMENT */}
            <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2 mt-4">
              <Building2 size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Rack Placement
              </span>
            </div>
            <div>
              <label className={labelStyles}>Rack Name</label>
              <input
                type="text"
                className={inputStyles}
                placeholder="e.g. A-01"
                value={formData.rack_name}
                onChange={(e) =>
                  setFormData({ ...formData, rack_name: e.target.value })
                }
              />
            </div>
            <div>
              <label className={labelStyles}>Rack Unit (U)</label>
              <input
                type="text"
                className={inputStyles}
                placeholder="e.g. 12"
                value={formData.rack_unit}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rack_unit: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div>
              <label className={labelStyles}>U-Space Height</label>
              <input
                type="number"
                className={inputStyles}
                value={formData.rack_uspace}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rack_uspace: parseInt(e.target.value) || 1,
                  })
                }
              />
            </div>

            {/* SECTION: SPECS */}
            <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2 mt-4">
              <Network size={14} className="text-orange-500" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Connectivity & Power
              </span>
            </div>
            <div>
              <label className={labelStyles}>Eth Ports</label>
              <input
                type="number"
                className={inputStyles}
                value={formData.device_nports}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    device_nports: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className={labelStyles}>Fibre Ports</label>
              <input
                type="number"
                className={inputStyles}
                value={formData.device_sports}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    device_sports: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div>
              <label className={labelStyles}>Power (Watts)</label>
              <input
                type="number"
                className={inputStyles}
                value={formData.device_power}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    device_power: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* SECTION: STATUS */}
            <div className="md:col-span-3 border-b dark:border-gray-700 pb-2 flex items-center gap-2 mb-2 mt-4">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Initial Status
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700">
              <span className="text-xs font-bold dark:text-white">
                Redundant Power
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    power_status: !formData.power_status,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.power_status ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span
                  className={`${formData.power_status ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border dark:border-gray-700">
              <span className="text-xs font-bold dark:text-white">
                Active Online
              </span>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    device_status: !formData.device_status,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.device_status ? "bg-emerald-500" : "bg-gray-300"}`}
              >
                <span
                  className={`${formData.device_status ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-12">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border dark:border-gray-700 rounded-xl font-bold dark:text-gray-300 transition-all hover:bg-gray-50"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-black shadow-xl flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest transition-all hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} /> Finalize Provisioning
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInventoryModal;
