"use client";

import { ReactNode, useEffect } from "react";
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

  const roleAllowed = !requiredRoles || (!!user && requiredRoles.includes(user.role));

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else if (!roleAllowed) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, roleAllowed, router]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton variant="card" />
        <SkeletonGroup count={3} />
      </div>
    );
  }

  // Not authenticated, or role check failed — redirect is in-flight via the effect above
  if (!isAuthenticated || !roleAllowed) {
    return null;
  }

  return <>{children}</>;
}
