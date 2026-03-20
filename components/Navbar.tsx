"use client";
// Top navigation bar shown on every protected page.
// Uses usePathname to highlight the active link.

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
        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
          active
            ? "bg-brand-50 text-brand-600"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand + nav links */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🏃</span>
            <span className="font-bold text-gray-900">Corrida</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navLink("/dashboard", "Dashboard")}
            {navLink("/groups", "Grupos")}
          </nav>
        </div>

        {/* User info + sign out */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[160px]">
            {userEmail}
          </span>
          <button onClick={handleSignOut} className="btn-ghost text-sm">
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
