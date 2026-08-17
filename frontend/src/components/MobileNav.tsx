"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Award, User, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide mobile nav on login/register pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const navItems = [
    {
      name: "Kurslar",
      href: "/courses",
      icon: BookOpen,
      isActive: pathname === "/courses" || pathname === "/",
    },
    {
      name: "Sertifikat",
      href: "/verify",
      icon: Award,
      isActive: pathname === "/verify",
    },
  ];

  if (user) {
    if (user.is_staff) {
      navItems.push({
        name: "Admin",
        href: "/admin",
        icon: ShieldCheck,
        isActive: pathname.startsWith("/admin"),
      });
    } else {
      navItems.push({
        name: "Profil",
        href: "/profile",
        icon: User,
        isActive: pathname.startsWith("/profile"),
      });
    }
  } else {
    navItems.push({
      name: "Kirish",
      href: "/login",
      icon: User,
      isActive: false,
    });
  }

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                item.isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon size={24} className={item.isActive ? "text-blue-600" : ""} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
