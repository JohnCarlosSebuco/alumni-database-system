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

export function AuthGuard({ children, requiredRole, redirectTo = "/login" }: AuthGuardProps) {
  const { user, userDoc, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace(redirectTo);
      return;
    }
    if (requiredRole && userDoc?.role !== requiredRole) {
      const fallback = userDoc?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      router.replace(fallback);
    }
  }, [user, userDoc, loading, requiredRole, redirectTo, router]);

  if (loading) return <PageLoader />;
  if (!user) return null;
  if (requiredRole && userDoc?.role !== requiredRole) return null;

  return <>{children}</>;
}
