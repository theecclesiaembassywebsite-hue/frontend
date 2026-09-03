import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";

export const metadata: Metadata = {
  title: {
    default: "Authentication",
    template: "%s | The Ecclesia Embassy",
  },
  description: "Sign in or create an account to access The Ecclesia Embassy platform",
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-off-white flex flex-col">
      {/* Login/signup are the last two pages still using framer-motion's
          `motion.div` directly; this scopes the reduced-motion respect that
          used to come from a sitewide MotionProvider to just this segment. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </main>
  );
}
