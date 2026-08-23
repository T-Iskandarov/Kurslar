"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, BookOpen, Settings, Award, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Hide navbar on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              {user ? (
                <>
                  <div className={`p-1.5 rounded-lg text-white ${user.gender === 'ayol' ? 'bg-pink-500' : 'bg-blue-600'}`}>
                    {user.gender === 'ayol' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                        <path d="M8 7v2c0 2-2 4-2 4"/>
                        <path d="M16 7v2c0 2 2 4 2 4"/>
                      </svg>
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <span className="text-xl font-bold tracking-tight">
                    <span className="text-gray-900">{user.full_name?.split(' ')[0]}</span>{' '}
                    <span className="text-blue-600">{user.full_name?.split(' ').slice(1).join(' ')}</span>
                  </span>
                </>
              ) : (
                <>
                  <div>
                    <img src="/logo.png" alt="Kurslarim" className="w-8 h-8 object-contain" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 tracking-tight">
                    Tursunpo'lat Iskandarov <span className="text-blue-600">kurslari</span>
                  </span>
                </>
              )}
            </Link>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/verify"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Award size={18} />
              <span>Sertifikatni tekshirish</span>
            </Link>
            {user ? (
              <>
                <Link href={user.is_staff ? "/admin" : "/profile"} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  {user.is_staff ? <ShieldCheck size={18} className="text-gray-500" /> : <User size={18} className="text-gray-500" />}
                  <span>{user.is_staff ? "Admin Panel" : "Shaxsiy kabinet"}</span>
                </Link>
                
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  <span>Chiqish</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Kirish
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Ro'yxatdan o'tish
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
