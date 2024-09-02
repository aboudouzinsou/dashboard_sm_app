"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Accès non autorisé
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Désolé, vous n'avez pas l'autorisation d'accéder à cette page.
        </p>
        <div className="space-x-4">
          <Link href="/" passHref>
            <Button variant="outline">Accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
