"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deviceName: string;
};

const DeleteDeviceModal = ({
  isOpen,
  onClose,
  onConfirm,
  deviceName,
}: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-gray-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-auto my-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-none flex flex-col w-full outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-red-500" size={24} />
              Delete Device
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="relative p-6 flex-auto">
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                &quot;{deviceName}&quot;
              </span>
              ? This action cannot be undone and will remove all associated
              metric history.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-500/30 transition-all active:scale-95"
            >
              Delete Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDeviceModal;
