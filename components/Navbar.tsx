"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import NotificationBell from "@/components/NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = userEmail.slice(0, 2).toUpperCase();

  const navLink = (href: string, label: string) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
          active
            ? "bg-gradient-to-r from-brand-600 to-indigo-500 text-white shadow-sm"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-10 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Brand + nav */}
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="text-xl">🏃</span>
            <span className="font-black text-gray-900 tracking-tight">4run</span>
          </Link>

          <nav className="flex items-center gap-1">
            {navLink("/dashboard", "Dashboard")}
            {navLink("/runs", "Corridas")}
            {navLink("/groups", "Grupos")}
          </nav>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          {userEmail && (
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500
                              flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {initials}
              </div>
              <span className="text-xs text-gray-500 truncate max-w-[140px]">{userEmail}</span>
            </div>
          )}
          <NotificationBell />
          <UserButton />
        </div>

      </div>
    </header>
  );
}
