"use client";

import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import {
  Menu,
  LucideIcon,
  Layout,
  User,
  Clipboard,
  CircleDollarSign,
  SlidersHorizontal,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        }
        hover:text-blue-500 hover:bg-blue-100 gap-3 transition-colors ${
          isActive ? "bg-blue-200 text-white" : ""
        }`}
      >
        <Icon className="w-6 h-6 !text-gray-700" />

        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium text-gray-700`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [beIdentity, setBeIdentity] = useState({ pod: "...", node: "..." });
  const [feIdentity, setFeIdentity] = useState({ pod: "...", node: "..." });

  useEffect(() => {
    // 1. Fetch Backend Identity
    const fetchBeIdentity = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/health/healthz`,
        );
        if (response.ok) {
          const data = await response.json();
          setBeIdentity({
            pod: data.pod_name || "unknown",
            node: data.node_hostname || "unknown",
          });
        }
      } catch (error) {
        console.error("Sidebar backend identity fetch failed:", error);
      }
    };

    // 2. Fetch Frontend Identity (from your new internal API route)
    const fetchFeIdentity = async () => {
      try {
        const response = await fetch("/api/health?type=live");
        if (response.ok) {
          const data = await response.json();
          setFeIdentity({
            pod: data.pod_name || "unknown",
            node: data.node_name || "unknown",
          });
        }
      } catch (error) {
        console.error("Sidebar frontend identity fetch failed:", error);
      }
    };

    fetchBeIdentity();
    fetchFeIdentity();
  }, []);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  // Helper to safely truncate pod names
  const formatPod = (name: string) => {
    if (name === "..." || name === "unknown") return name;
    return `...${name.slice(-8)}`;
  };

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <Image
          src={isDarkMode ? "/logo-light.png" : "/logo-dark.png"}
          alt="dcim-logo"
          width={27}
          height={27}
          className="rounded w-8"
        />
        <h1
          className={`${
            isSidebarCollapsed ? "hidden" : "block"
          } font-extrabold text-2xl tracking-wide text-gray-900`}
        >
          DCIM
        </h1>

        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex-grow mt-8">
        <SidebarLink
          href="/dashboard"
          icon={Layout}
          label="Dashboard"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/Inventory"
          icon={Clipboard}
          label="Inventory"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/Resources"
          icon={CircleDollarSign}
          label="Resources"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/Company"
          icon={User}
          label="Company"
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLink
          href="/Settings"
          icon={SlidersHorizontal}
          label="Settings"
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* FOOTER SECTION */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10 px-8`}>
        {/* IDENTITY TABLE */}
        <div className="mb-4 text-[10px] text-gray-400 font-mono bg-gray-50 p-2 rounded border border-gray-100 shadow-sm">
          <div className="flex justify-between border-b border-gray-200 pb-1 mb-1">
            <span className="font-bold text-gray-500 uppercase">
              System Info
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>be_node:</span>
            <span className="text-gray-700 font-semibold">
              {beIdentity.node}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>be_pod:</span>
            <span
              className="text-gray-700 truncate ml-2"
              title={beIdentity.pod}
            >
              {formatPod(beIdentity.pod)}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>fe_node:</span>
            <span className="text-gray-700 font-semibold">
              {feIdentity.node}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span>fe_pod:</span>
            <span
              className="text-gray-700 truncate ml-2"
              title={feIdentity.pod}
            >
              {formatPod(feIdentity.pod)}
            </span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">
          &copy; 2026 Pramod Murukesan
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
