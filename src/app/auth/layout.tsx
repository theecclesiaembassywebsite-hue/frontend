import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication — The Ecclesia Embassy",
  description: "Sign in or create an account to access The Ecclesia Embassy platform",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-off-white flex flex-col">
      {children}
    </main>
  );
}
