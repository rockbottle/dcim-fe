"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation, useCreateUserMutation } from "@/state/api"; // Added createUser
import { Lock, Mail, Loader2, ShieldCheck, AlertCircle, Building2, UserPlus, LogIn } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  
  // Toggle between Login and Registration
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // API Mutations
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [createUser, { isLoading: isRegisterLoading }] = useCreateUserMutation();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (isRegistering) {
        // --- REGISTRATION LOGIC ---
        await createUser({
          username,
          email,
          password,
          company_name: companyName, // Backend uses this for unique company ID logic
        }).unwrap();
        
        setSuccessMessage("Account created! You can now login.");
        setIsRegistering(false); // Move user to login view
      } else {
        // --- LOGIN LOGIC ---
        const response = await login({ username, password }).unwrap();
        
        localStorage.setItem("auth_token", response.access_token);
        localStorage.setItem("username", response.username);
        localStorage.setItem("user_id", response.user_id);

        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err.data?.detail || "Action failed. Please check backend connection.";
      setErrorMessage(typeof msg === "string" ? msg : "An error occurred");
    }
  };

  const isLoading = isLoginLoading || isRegisterLoading;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#080b12] p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-blue-600 rounded-2xl shadow-lg mb-4">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black dark:text-white uppercase tracking-tight">
              {isRegistering ? "Create Account" : "DCIM Portal"}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {isRegistering ? "Join the Inventory System" : "Authorized Access Only"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl border border-red-100 dark:border-red-800 animate-shake">
                <AlertCircle size={16} /> {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl border border-emerald-100 dark:border-emerald-800">
                <ShieldCheck size={16} /> {successMessage}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text" required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Email Field (Registration Only) */}
            {isRegistering && (
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email" required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    placeholder="name@company.com"
                  />
                </div>
              </div>
            )}

            {/* Company Name Field (Registration Only) */}
            {isRegistering && (
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text" required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                    placeholder="Enter unique company name"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password" required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : isRegistering ? (
                <><UserPlus size={18} /> Register Account</>
              ) : (
                <><LogIn size={18} /> Initialize Session</>
              )}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className="text-[10px] font-black text-gray-500 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors"
            >
              {isRegistering ? "Already have an account? Login" : "Need a new account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;