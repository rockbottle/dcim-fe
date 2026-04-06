"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import StoreProvider, { useAppSelector } from "@/app/redux";
import { usePathname, useRouter } from "next/navigation"; 
import { 
  useGetInventoryQuery, 
  useGetMyDetailsQuery 
} from "@/state/api";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const isAuthPage = pathname === "/Login" || pathname === "/login";

  // --- AUTH GUARD LOGIC ---
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token && !isAuthPage) {
      // If no token and trying to access a protected page, redirect to Login
      router.push("/Login");
    } else {
      // Allow rendering once we've checked the token
      setIsAuthChecked(true);
    }
  }, [pathname, isAuthPage, router]);

  // Data fetching (only runs if authenticated AND not on login page)
  const { isFetching: isInvFetching } = useGetInventoryQuery(undefined, { 
    skip: isAuthPage || !isAuthChecked 
  });
  const { isFetching: isDetFetching } = useGetMyDetailsQuery(undefined, { 
    skip: isAuthPage || !isAuthChecked 
  });

  const isGlobalLoading = isInvFetching || isDetFetching;

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // 1. Prevent "Flicker": Don't show anything until we know the auth status
  if (!isAuthChecked && !isAuthPage) {
    return <div className="h-screen w-screen bg-gray-50 dark:bg-dark-bg" />; 
  }

  // 2. Clean return for Login page
  if (isAuthPage) {
    return (
      <div className={`${isDarkMode ? "dark" : "light"} w-full min-h-screen bg-gray-50 dark:bg-dark-bg`}>
        {children}
      </div>
    );
  }

  // 3. Protected Dashboard Layout
  return (
    <div className={`${isDarkMode ? "dark" : "light"} flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
      <Sidebar />
      <main className={`flex flex-col w-full h-full py-7 px-9 bg-gray-50 dark:bg-dark-bg ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"}`}>
        <Navbar />
        {isGlobalLoading && (
          <div className="fixed top-0 left-0 w-full h-1 bg-blue-500/20 z-[9999]">
            <div className="h-full bg-blue-600 animate-pulse w-1/3" />
          </div>
        )}
        <div className="mt-4">
          {children}
        </div>
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;