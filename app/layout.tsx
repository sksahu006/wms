import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Warehouse Management System",
  keywords: [
    "warehouse management",
    "inventory control",
    "space rental",
    "client management",
    "invoice management",
    "agreement management",
    "support system",
  ],
    icons: {
    icon: "/logo-wms.png",               // default favicon
    
  },
  
  description: "Manage warehouse space rentals, clients, invoices and more",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}