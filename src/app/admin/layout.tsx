import type { Metadata } from "next";
import AdminLayoutClient from "./AdminLayoutClient";

// The admin panel is authenticated-only; search engines should never index
// it, and the interactive chrome lives in AdminLayoutClient because a
// metadata export cannot appear in a "use client" file.
export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Admin | The Ecclesia Embassy",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
