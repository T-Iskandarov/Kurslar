"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Award, Settings, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const links = [
    { href: "/profile/courses", label: "Mening kurslarim", icon: BookOpen },
    { href: "/profile/certificates", label: "Sertifikatlarim", icon: Award },
    { href: "/profile/settings", label: "Sozlamalar", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${user.gender === 'ayol' ? 'bg-pink-500' : 'bg-blue-600'}`}>
                {user.gender === 'ayol' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M8 7v2c0 2-2 4-2 4"/>
                    <path d="M16 7v2c0 2 2 4 2 4"/>
                  </svg>
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className="overflow-hidden">
                <h2 className="font-semibold text-gray-900 truncate" title={user.full_name}>{user.full_name}</h2>
                <p className="text-sm text-gray-500">{user.phone}</p>
              </div>
            </div>

            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
              
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
                Chiqish
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
