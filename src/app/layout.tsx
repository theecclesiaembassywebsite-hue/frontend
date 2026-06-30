import type { Metadata } from "next";
import { Montserrat, Raleway, Crimson_Text, Anton } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import { MotionProvider } from "@/components/ui/MotionProvider";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const crimsonText = Crimson_Text({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Ecclesia Embassy | Welcome Home",
  description:
    "The Ecclesia Embassy is a global apostolic and prophetic movement raising Word-cultured ambassadors through worship, teaching, prayer, and community.",
  keywords: [
    "The Ecclesia Embassy",
    "church",
    "global movement",
    "apostolic",
    "prophetic",
    "Victor Oluwadamilare",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${montserrat.variable} ${raleway.variable} ${crimsonText.variable} ${anton.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ToastProvider>
            <MotionProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </MotionProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
