"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="flex min-h-screen bg-off-white">
        <AdminSidebar />
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
