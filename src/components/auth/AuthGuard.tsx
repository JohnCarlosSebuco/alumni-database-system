"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { PageLoader } from "@/components/ui/Spinner";
import type { UserRole } from "@/lib/types/alumni.types";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

const ROLE_LEVEL: Record<string, number> = { alumni: 0, admin: 1, super_admin: 2 };

function hasRequiredRole(userRole: string, required: string) {
  return (ROLE_LEVEL[userRole] ?? 0) >= (ROLE_LEVEL[required] ?? 0);
}

export function AuthGuard({ children, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (requiredRole && !hasRequiredRole(userDoc?.role ?? "", requiredRole)) {
      const fallback = hasRequiredRole(userDoc?.role ?? "", "admin") ? "/admin/dashboard" : "/dashboard";
      router.replace(fallback);
    }
  }, [user, userDoc, loading, requiredRole, redirectTo, router]);

  if (loading) return <PageLoader />;
  if (!user) return null;
  if (requiredRole && !hasRequiredRole(userDoc?.role ?? "", requiredRole)) return null;

  return <>{children}</>;
}
