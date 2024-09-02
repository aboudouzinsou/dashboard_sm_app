"use client";

import React, { useState, useEffect, useMemo } from "react";
import SidebarButton from "./SidebarButton";
import {
  Home,
  Settings,
  ChevronLeft,
  ChevronRight,
  Boxes,
  Factory,
  ShoppingCart,
  BadgeDollarSign,
  Notebook,
  User2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleButtonClick = (label: string, path: string) => {
    setActiveButton(label);
    router.push(path);
  };

  const menuItems = useMemo(
    () => [
      {
        icon: Home,
        label: "Dashboard",
        path: "/",
        roles: ["admin", "manager"],
      },
      {
        icon: Boxes,
        label: "Products",
        path: "/products",
        roles: ["admin", "manager"],
      },
      {
        icon: Notebook,
        label: "Inventory",
        path: "/inventory",
        roles: ["admin", "manager"],
      },
      {
        icon: Factory,
        label: "Suppliers",
        path: "/suppliers",
        roles: ["admin", "manager"],
      },
      {
        icon: ShoppingCart,
        label: "POS",
        path: "/POS",
        roles: ["seller"],
      },
      {
        icon: BadgeDollarSign,
        label: "Sales",
        path: "/sales",
        roles: ["admin", "manager"],
      },
      {
        icon: User2,
        label: "Users",
        path: "/users",
        roles: ["admin", "manager"],
      },
      {
        icon: Settings,
        label: "Settings",
        path: "/settings",
        roles: ["admin"],
      },
    ],
    [],
  ); // Le tableau de dépendances est vide car menuItems ne dépend d'aucune variable

  useEffect(() => {
    const currentMenuItem = menuItems.find((item) => item.path === pathname);
    if (currentMenuItem && user && !currentMenuItem.roles.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [pathname, user, router, menuItems]);

  if (pathname === "/login" || !user) return null;

  const authorizedMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside
      className={`relative flex flex-col border-r bg-gray-100 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <button
        className="absolute top-4 -right-3 z-40 p-2 bg-gray-200 rounded-full"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-6 w-6" />
        ) : (
          <ChevronLeft className="h-6 w-6" />
        )}
      </button>
      <nav className="flex-1 p-4 space-y-2">
        {authorizedMenuItems.map((item) => (
          <SidebarButton
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={activeButton === item.label}
            isCollapsed={isCollapsed}
            onClick={() => handleButtonClick(item.label, item.path)}
          />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
