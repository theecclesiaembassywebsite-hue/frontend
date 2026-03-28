"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="card" />
        <SkeletonGroup count={3} />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  // Check role if required
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    router.push("/dashboard");
    return null;
  }

  return <>{children}</>;
}
