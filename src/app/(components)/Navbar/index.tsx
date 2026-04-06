"use client";
import { 
  Menu, Moon, Search, Sun, Lock, LogOut, ChevronDown, Check, Loader2 
} from "lucide-react"; // REMOVED: Bell
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed, setIsDarkMode, setSearchTerm } from "@/state"; 
import { useGetCurrentUserQuery, useUpdateUserMutation, useGetInventoryQuery } from "@/state/api";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: currentUserData } = useGetCurrentUserQuery();
  const { data: inventory = [] } = useGetInventoryQuery();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  
const currentUser = Array.isArray(currentUserData) ? currentUserData[0] : currentUserData;
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const searchTerm = useAppSelector((state) => state.global.searchTerm);

  const toggleSidebar = () => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  const toggleDarkMode = () => dispatch(setIsDarkMode(!isDarkMode));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const deviceExists = inventory.some(d => 
      d.device_hostname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (deviceExists) {
      router.push(`/Inventory?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ password: newPassword }).unwrap();
      setIsPasswordModalOpen(false);
      setNewPassword("");
      alert("Password updated successfully!");
    } catch (_err) {
      alert("Failed to update password.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-between items-center w-full mb-7">
      <div className="flex justify-between items-center gap-5">
        <button
          className="px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4 dark:text-white" />
        </button>

        <form onSubmit={handleSearch} className="relative">
          <input
            type="search"
            placeholder="Search Hostname (Enter to go)"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="pl-10 pr-4 py-2 w-50 md:w-80 border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:border-blue-500 transition-all"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-500 dark:text-gray-400" />
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center gap-5">
        <div className="hidden md:flex justify-between items-center gap-5">
          <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            {isDarkMode ? <Sun className="text-orange-400" size={24} /> : <Moon className="text-gray-500" size={24} />}
          </button>
          
          {/* REMOVED: Bell Notification Block */}

          <hr className="w-0 h-7 border-l border-gray-300 dark:border-gray-700 mx-3" />
          
          <div className="relative" ref={menuRef}>
            <div 
              className="flex items-center gap-3 cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-black uppercase shadow-md">
                {currentUser?.username.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <span className="block text-xs font-black text-gray-800 dark:text-white uppercase tracking-tighter">
                  {currentUser?.username || "Loading..."}
                </span>
                <span className="text-[10px] text-gray-500 font-bold uppercase">{currentUser?.company_name}</span>
              </div>
              <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
            </div>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[100] py-2">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logged in as</p>
                    <p className="text-xs font-bold dark:text-white truncate">{currentUser?.email}</p>
                </div>

                <button 
                  onClick={() => { setIsPasswordModalOpen(true); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 font-bold"
                >
                  <Lock size={16} /> Change Password
                </button>

                <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                
                <button 
                  onClick={() => { localStorage.clear(); window.location.href = "/Login"; }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-black hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors uppercase tracking-widest"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PASSWORD CHANGE MODAL (Remains unchanged) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsPasswordModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-black dark:text-white uppercase mb-6 flex items-center gap-2">
              <Lock className="text-blue-500" /> Security
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">New Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white font-bold"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <button 
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;