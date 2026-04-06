"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Clear Local Storage (Redux Persist lives here)
    localStorage.clear();

    // 2. Optional: Clear specific cookies if you use them
    // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    // 3. Brief delay for visual feedback, then redirect to login
    const timer = setTimeout(() => {
      router.push("/Login"); // or wherever your login page is
      router.refresh();      // Force refresh to clear any remaining memory state
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col items-center gap-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <div className="text-center">
          <h1 className="text-xl font-black dark:text-white uppercase tracking-tight">Terminating Session</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Securing your infrastructure data...</p>
        </div>
      </div>
    </div>
  );
}