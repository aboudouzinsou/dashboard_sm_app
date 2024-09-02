"use client"; // Assurez-vous que le composant est un Client Component

import { AuthProvider } from "@/context/AuthContext";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import ProfileHeader from "@/components/ProfileHeader";
import Sidebar from "@/components/Sidebar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen w-full bg-background font-sans antialiased flex flex-col",
          fontSans.variable,
          {
            "debug-screens": process.env.NODE_ENV === "development",
          },
        )}
      >
        <AuthProvider>
          <div className="flex flex-1 flex-col">
            {/* Afficher ProfileHeader uniquement si la route n'est pas /login */}
            <ProfileHeader />
            <div className="flex flex-1">
              {/* Sidebar */}
              <Sidebar />
              {/* Main content */}
              <main className="flex-1 p-8">{children}</main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
