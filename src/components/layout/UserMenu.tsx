"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut } from "@/lib/firebase/auth";
import { useToast } from "@/components/ui/Toast";

export function UserMenu() {
  const { user, userDoc } = useAuth();
  const { error } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch {
      error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
      >
        <Avatar
          src={user?.photoURL ?? userDoc?.photoURL}
          name={userDoc?.displayName ?? user?.displayName ?? ""}
          size="sm"
        />
        <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          {userDoc?.displayName ?? user?.displayName}
        </span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white shadow-modal border border-gray-100 py-1 z-50 animate-slide-up">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {userDoc?.displayName ?? user?.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <Link
            href={userDoc?.role === "admin" || userDoc?.role === "super_admin" ? "/admin/dashboard" : "/profile"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <User size={15} />
            My Profile
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
