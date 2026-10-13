"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["ADMIN", "SUPER_ADMIN", "CONTENT_MANAGER", "CHURCH_SERVANT_COORDINATOR", "KISOLAM_ADMIN", "TEMA_ADMIN"]}>
      <div className="flex min-h-screen flex-col bg-off-white lg:flex-row">
        <AdminSidebar />
        <div className="min-w-0 flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
