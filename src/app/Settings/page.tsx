"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/redux"; 
import { setIsDarkMode } from "@/state"; 

import { 
  Shield, Database, Monitor, 
  Save, RefreshCw, FileText, Lock, Trash2, AlertOctagon 
} from "lucide-react";

// --- TYPES ---
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

interface SettingsSelectProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

interface SystemSettings {
  refreshInterval: string;
  reportFormat: string;
  permissions: string;
}

const Settings = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [activeTab, setActiveTab] = useState("general");
  const [mounted, setMounted] = useState(false);

  // Form State
  const [settings, setSettings] = useState<SystemSettings>({
    refreshInterval: "30s",
    reportFormat: "PDF",
    permissions: "Admin",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSave = () => {
    alert("System configuration updated.");
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-black dark:text-white tracking-tight uppercase">Settings</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Configure Infrastructure Dashboard</p>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-500/20 uppercase text-xs tracking-widest transition-all active:scale-95"
        >
          <Save size={18} /> Save Settings
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR NAVIGATION */}
        <div className="lg:w-64 flex flex-col gap-2">
          <TabButton active={activeTab === "general"} onClick={() => setActiveTab("general")} icon={<Monitor size={18} />} label="General" />
          <TabButton active={activeTab === "system"} onClick={() => setActiveTab("system")} icon={<Database size={18} />} label="System & Reports" />
          <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Shield size={18} />} label="Permissions" />
        </div>

        {/* CONTENT PANEL */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm min-h-[500px]">
          
          {/* TAB: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <SectionHeader title="Dashboard Appearance" description="Adjust the visual settings for your local session." />
              <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Monitor size={20} /></div>
                  <div>
                    <p className="text-sm font-black dark:text-white uppercase tracking-tight">Dark Mode</p>
                    <p className="text-xs text-gray-400">Reduce eye strain in low-light environments.</p>
                  </div>
                </div>
                <button 
                  onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 ${isDarkMode ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            </div>
          )}

          {/* TAB: SYSTEM & REPORTS */}
          {activeTab === "system" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <SectionHeader title="Operations" description="Manage data polling and reporting defaults." />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SettingsSelect 
                  label="Refresh Interval" 
                  icon={<RefreshCw size={14} />}
                  value={settings.refreshInterval}
                  onChange={(v) => setSettings({...settings, refreshInterval: v})}
                  options={["Manual", "15s", "30s", "1m", "5m"]}
                />
                <SettingsSelect 
                  label="Default Report Format" 
                  icon={<FileText size={14} />}
                  value={settings.reportFormat}
                  onChange={(v) => setSettings({...settings, reportFormat: v})}
                  options={["PDF", "CSV", "JSON"]}
                />
              </div>

              {/* DANGER ZONE */}
              <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-red-500 mb-4">
                  <AlertOctagon size={18} />
                  <h4 className="text-xs font-black uppercase tracking-widest">Danger Zone</h4>
                </div>
                <div className="p-6 border border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold dark:text-white">Clear Local Cache</p>
                    <p className="text-xs text-gray-500">This will reset all your persisted dashboard settings.</p>
                  </div>
                  <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    <Trash2 size={14} /> Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PERMISSIONS */}
          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <SectionHeader title="Access Control" description="View and manage user authority levels." />
              <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 rounded-2xl flex items-center gap-4">
                <Shield className="text-blue-500" />
                <p className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide">
                  Account Level: You have administrative access to all nodes.
                </p>
              </div>
              <SettingsSelect 
                label="Assigned Role" 
                icon={<Lock size={14} />}
                value={settings.permissions}
                onChange={(v) => setSettings({...settings, permissions: v})}
                options={["Viewer", "Operator", "Admin"]}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const SectionHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="mb-6">
    <h3 className="text-lg font-black dark:text-white uppercase tracking-tight">{title}</h3>
    <p className="text-sm text-gray-400 font-medium">{description}</p>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/40"
    }`}
  >
    {icon} {label}
  </button>
);

const SettingsSelect = ({ label, icon, value, options, onChange }: SettingsSelectProps) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 italic">
      {icon} {label}
    </label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default Settings;