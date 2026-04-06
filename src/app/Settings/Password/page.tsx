"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";

const Password = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({
    type: null,
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: "New passwords do not match." });
      return;
    }

    if (formData.newPassword.length < 8) {
      setStatus({ type: 'error', message: "Password must be at least 8 characters." });
      return;
    }

    // Trigger your API call here
    setStatus({ type: 'success', message: "Password updated successfully!" });
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Section */}
        <div className="bg-slate-800 dark:bg-slate-900 p-6 text-white flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Lock size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Security</h1>
            <p className="text-slate-400 text-sm">Manage your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Status Message */}
          {status.type && (
            <div className={`flex items-center gap-3 p-4 rounded-lg text-sm font-medium animate-in fade-in zoom-in-95 ${
              status.type === 'success' 
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}>
              {status.type === 'success' ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
              {status.message}
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                required
                className="w-full pl-4 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-700 my-4" />

          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                required
                className="w-full pl-4 pr-12 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              />
              <button 
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98]"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Password;