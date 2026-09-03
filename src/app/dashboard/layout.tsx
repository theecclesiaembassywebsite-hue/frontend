import type { Metadata } from "next";

// Member dashboard is authenticated-only; search engines should never index it.
export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Dashboard | The Ecclesia Embassy",
  },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
