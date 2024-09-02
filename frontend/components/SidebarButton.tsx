import React from "react";
import { Button } from "@/components/ui/button"; // Assurez-vous que le chemin est correct
import { Icon as LucideIcon } from "lucide-react"; // Assurez-vous d'importer les icônes nécessaires

interface SidebarButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Utilisez le type pour les composants SVG
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon: IconComponent,
  label,
  isActive,
  isCollapsed,
  onClick,
}) => {
  return (
    <Button
      variant={isActive ? "default" : "ghost"} // Utilisez une valeur correcte pour `variant`
      className={`w-full justify-center text-left flex items-center space-x-4 p-2 rounded-md ${
        isCollapsed ? "justify-center" : "justify-start"
      }`}
      onClick={onClick}
    >
      <IconComponent
        className={`h-6 w-6 ${isActive ? "text-blue-500" : "text-gray-500"}`}
      />
      {!isCollapsed && <span className="text-sm ml-2">{label}</span>}{" "}
      {/* Affiche le label uniquement si non réduit */}
    </Button>
  );
};

export default SidebarButton;
