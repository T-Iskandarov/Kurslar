import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tursunpo'lat Iskandarov",
  description: "Masofaviy ta'lim platformasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-[#FDFDFE] text-gray-900 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Toaster position="top-center" />
          <div className="print:hidden">
            <Navbar />
          </div>
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <div className="print:hidden">
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
