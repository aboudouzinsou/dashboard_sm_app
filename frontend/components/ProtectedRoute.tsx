"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si l'utilisateur est authentifié ou que les données utilisateur sont chargées, arrêter le chargement
    if (user || isAuthenticated) {
      setIsLoading(false);
    } else {
      const storedToken = localStorage.getItem("token");

      // Si le token est stocké mais que l'utilisateur n'est pas encore défini, essayer de le récupérer
      if (!user && storedToken) {
        // Optionnel : Récupérer le profil utilisateur ici (par exemple via un hook ou un autre moyen)
        setIsLoading(false);
      } else {
        // Pas de token, l'utilisateur n'est pas authentifié
        router.push("/login");
      }
    }
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return <div>Chargement...</div>; // Affiche un indicateur de chargement pendant la vérification de l'authentification
  }

  if (!isAuthenticated) {
    return null; // Empêche l'affichage du contenu tant que l'utilisateur n'est pas authentifié
  }

  return <>{children}</>;
};

export default ProtectedRoute;
