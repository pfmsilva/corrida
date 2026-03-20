"use client";
// Top navigation bar shown on every protected page.

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavbarProps {
  userEmail: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // After sign-out, refresh so the middleware redirects to /login
    router.refresh();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🏃</span>
          <span className="font-bold text-gray-900">Corrida</span>
        </div>

        {/* User info + sign out */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[180px]">
            {userEmail}
          </span>
          <button onClick={handleSignOut} className="btn-ghost text-sm">
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
