"use client"; // Assurez-vous que le composant est un Client Component

import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const ProfileHeader = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return pathname !== "/login" ? (
    <header className="flex items-center justify-between border-b bg-white p-4 shadow-md">
      <div className="flex items-center space-x-4">
        <User className="h-8 w-8 text-gray-500" />
        <span className="text-lg font-semibold">
          {user?.name || "Utilisateur"}
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-6 w-6 text-gray-500" />
          <span className="sr-only">Déconnexion</span>
        </Button>
      </div>
    </header>
  ) : null;
};

export default ProfileHeader;
