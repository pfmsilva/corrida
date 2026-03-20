"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  userEmail: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

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

  const initials = userEmail.slice(0, 2).toUpperCase();

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

        {/* User + sign out */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-indigo-500
                            flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              {initials}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[140px]">{userEmail}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100
                       px-3 py-1.5 rounded-lg transition-all duration-200 font-medium"
          >
            Sair
          </button>
        </div>

      </div>
    </header>
  );
}
