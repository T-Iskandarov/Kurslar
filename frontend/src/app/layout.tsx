import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Analytics from "@/components/Analytics";
import { Toaster } from "react-hot-toast";

import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kurslarim.uz'),
  title: {
    default: "Tursunpo'lat Iskandarov | Masofaviy Ta'lim Platformasi",
    template: "%s | Tursunpo'lat Iskandarov",
  },
  description: "IT, Dasturlash, Sun'iy intellekt va zamonaviy kasblar bo'yicha masofaviy ta'lim platformasi. O'zingizga qiziq bo'lgan sohani tanlang va o'rganishni boshlang.",
  keywords: [
    "IT", "Dasturlash", "Frontend", "Backend", "Kompyuter savodxonligi", 
    "Sun'iy intellekt kurslari", "Prompt enjiniring", "Wibe coding kursi", 
    "kurslar", "online kurslar", "bepul kurslar", "robototexnika kurslari", 
    "Scratch kurslari", "Figma kurslari", "Tinkercad kurslari", 
    "Tursunpo'lat Iskandarov", "O'zbekistonda IT kurslar", "Masofaviy ta'lim"
  ],
  authors: [{ name: "Tursunpo'lat Iskandarov" }],
  creator: "Tursunpo'lat Iskandarov",
  publisher: "Kurslarim",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Tursunpo'lat Iskandarov | Kurslar",
    description: "Masofaviy ta'lim platformasi. O'zingizga qiziq bo'lgan sohani tanlang va o'rganishni boshlang.",
    url: 'https://kurslarim.uz',
    siteName: 'Kurslarim',
    images: [
      {
        url: '/og-image.jpg', // We should make sure an OG image exists or use a default one
        width: 1200,
        height: 630,
        alt: "Tursunpo'lat Iskandarov Kurslar",
      },
    ],
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Tursunpo'lat Iskandarov | Kurslar",
    description: "Masofaviy ta'lim platformasi",
    creator: "@T_Iskandarov",
  },
  manifest: "/manifest.json", 
};

export const viewport: Viewport = {
  themeColor: "#FDFDFE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
          <main className="flex-1 flex flex-col pb-16 sm:pb-0">
            {children}
          </main>
          <div className="print:hidden">
            <Footer />
            <MobileNav />
          </div>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
