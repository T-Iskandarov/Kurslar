"use client";

import { Phone, Camera, Send, Heart, User, BookOpen, Award } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-6 mb-6">
      <div className="max-w-7xl mx-auto bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] px-6 py-10 sm:px-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand/About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg w-8 h-8 flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Tursunpo'lat Iskandarov <span className="text-blue-600">kurslari</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Sifatli ta'lim va zamonaviy bilimlarni biz bilan birga o'rganing. 
              Sizning muvaffaqiyatingiz — bizning maqsadimiz.
            </p>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Biz bilan bog'lanish
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="tel:+998973173497" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <Phone size={18} />
                  <span>+998 97 317 34 97</span>
                </a>
              </li>
              <li>
                <a href="https://t.me/T_Iskandarov" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <Send size={18} />
                  <span>@T_Iskandarov</span>
                </a>
              </li>
              <li>
                <a href="https://instagram.com/T_Iskandarov_" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors">
                  <Camera size={18} />
                  <span>@T_Iskandarov_</span>
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@T_Iskandarov" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 7.1C2.1 8.4 2 10.2 2 12s.1 3.6.5 4.9c.4 1.4 1.5 2.5 2.9 2.9C6.8 20.3 12 20.5 12 20.5s5.2-.2 6.6-.7c1.4-.4 2.5-1.5 2.9-2.9.4-1.3.5-3.1.5-4.9s-.1-3.6-.5-4.9c-.4-1.4-1.5-2.5-2.9-2.9C17.2 3.7 12 3.5 12 3.5s-5.2.2-6.6.7c-1.4.4-2.5 1.5-2.9 2.9z"/>
                    <polygon points="9.5 8 15.5 12 9.5 16 9.5 8"/>
                  </svg>
                  <span>@T_Iskandarov</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Platforma
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
                  Barcha kurslar
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-500 hover:text-blue-600 transition-colors">
                  Profilga kirish
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Tursunpo'lat Iskandarov. Barcha huquqlar himoyalangan.
          </p>
          <div className="text-gray-500 text-sm flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> by <a href="https://cubo.uz" target="_blank" rel="noreferrer" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">CUBO.uz</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
