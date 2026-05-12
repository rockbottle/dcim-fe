"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  useGetMyTeamQuery,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetCurrentUserQuery,
  useUpdateUserMutation,
} from "@/state/api";
import {
  Search,
  UserPlus,
  Mail,
  Building2,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Globe,
  Loader2,
  Key,
} from "lucide-react";

// --- Define the User Interface ---
interface User {
  id?: number;
  username: string;
  email: string;
  company_name: string;
}

const Company = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for the Update Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<User | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- API HOOKS ---
  const { data: team = [], isLoading, refetch } = useGetMyTeamQuery();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [createUser] = useCreateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Force refresh on mount
  useEffect(() => {
    refetch();
  }, [refetch]);

  const currentUser = Array.isArray(currentUserData)
    ? currentUserData[0]
    : currentUserData;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = team.filter(
    (user: User) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      company_name: formData.get("company_name") as string,
    };

    try {
      await createUser(newUser).unwrap();
      setIsModalOpen(false);
      refetch();
    } catch (_err) {
      alert("Failed to create user. Check if username/email already exists.");
    }
  };

  const handleDelete = async (userId: number | undefined, username: string) => {
    if (window.confirm(`Are you sure you want to delete user: ${username}?`)) {
      try {
        await deleteUser().unwrap();

        if (username === currentUser?.username) {
          localStorage.removeItem("auth_token");
          window.location.href = "/Login";
        } else {
          refetch();
        }
      } catch (err: any) {
        const errorMessage =
          err?.data?.detail || "Delete failed. Please check backend logs.";
        alert(errorMessage);
        console.error("Delete failed:", err);
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );

  const inputStyles =
    "w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-bold";
  const labelStyles =
    "text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1";

  return (
    <div className="flex flex-col gap-6 pb-20 relative animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20">
            <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black dark:text-white tracking-tight uppercase">
              {currentUser?.company_name || "Company"} Directory
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2 font-medium">
              <Globe size={14} /> Organization Management
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-md active:scale-95"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full max-w-md">
        <input
          type="text"
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white shadow-sm font-bold"
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      {/* USERS TABLE */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-visible shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                User
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Email
              </th>
              <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredUsers.map((user: User) => (
              <tr
                key={user.email}
                className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-black text-sm uppercase">
                      {user.username.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black dark:text-white uppercase tracking-tight">
                        {user.username}
                      </span>
                      {user.username === currentUser?.username && (
                        <span className="text-[9px] font-black text-blue-500">
                          ACCOUNT OWNER
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-bold">
                    <Mail size={14} className="text-gray-400" />
                    {user.email}
                  </div>
                </td>

                <td className="px-6 py-4 text-right relative">
                  {user.username === currentUser?.username && (
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === user.username ? null : user.username
                        )
                      }
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500"
                    >
                      <MoreVertical size={20} />
                    </button>
                  )}

                  {openMenuId === user.username && (
                    <div
                      ref={menuRef}
                      className="absolute right-6 top-12 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors font-bold"
                        onClick={() => {
                          setUserToUpdate(user);
                          setIsUpdateModalOpen(true);
                          setOpenMenuId(null);
                        }}
                      >
                        <Edit2 size={16} className="text-blue-500" /> Update
                        Profile
                      </button>
                      <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2" />
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-bold"
                        onClick={() => {
                          handleDelete(user.id || 0, user.username);
                        }}
                      >
                        <Trash2 size={16} /> Delete Account
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                  Create New User
                </h2>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Registration will require email verification
                </p>
              </div>
              {/* FIX: Wrap X in a button with data-testid to ensure test compatibility */}
              <button
                data-testid="close-icon"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X
                  className="dark:text-gray-400 hover:text-red-500"
                  size={20}
                />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div>
                <label className={labelStyles}>Username</label>
                <input
                  name="username"
                  required
                  type="text"
                  placeholder="johndoe"
                  className={inputStyles}
                />
              </div>
              <div>
                <label className={labelStyles}>Email Address</label>
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="john@company.com"
                  className={inputStyles}
                />
              </div>
              <div>
                <label className={labelStyles}>Temporary Password</label>
                <div className="relative">
                  <Key
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    name="password"
                    required
                    type="password"
                    placeholder="••••••••"
                    className={`${inputStyles} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelStyles}>Assign Company</label>
                <div className="relative mt-1">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    name="company_name"
                    readOnly
                    defaultValue={currentUser?.company_name}
                    className={`${inputStyles} pl-10 text-gray-500 dark:text-gray-400 cursor-not-allowed`}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-black shadow-lg shadow-blue-500/20 mt-4 uppercase text-xs tracking-widest transition-all active:scale-[0.98]"
              >
                Register New Member
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE USER MODAL */}
      {isUpdateModalOpen && userToUpdate && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setIsUpdateModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black dark:text-white uppercase tracking-tight">
                Update Profile
              </h2>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X
                  className="dark:text-gray-400 hover:text-red-500"
                  size={20}
                />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                try {
                  await updateUser({
                    id: userToUpdate.id,
                    email: formData.get("email") as string,
                    username: userToUpdate.username,
                    company_name: userToUpdate.company_name,
                  }).unwrap();
                  setIsUpdateModalOpen(false);
                  refetch();
                } catch (err) {
                  alert("Update failed.");
                }
              }}
            >
              <div>
                <label className={labelStyles}>Email Address</label>
                <input
                  name="email"
                  required
                  type="email"
                  defaultValue={userToUpdate.email}
                  className={inputStyles}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-black uppercase text-xs tracking-widest mt-4"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Company;
