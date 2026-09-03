import type { Metadata } from "next";
import { Montserrat, Raleway, Crimson_Text, Anton } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ui/Toast";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "The Ecclesia Embassy | Welcome Home",
    template: `%s | ${SITE_NAME}`,
  },
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "The Ecclesia Embassy | Welcome Home",
    description:
      "A worshipping, praying, Kingdom focused global movement with a home base in Abuja, raising Word-cultured ambassadors who carry Christ into every sphere.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Ecclesia Embassy | Welcome Home",
    description:
      "A worshipping, praying, Kingdom focused global movement with a home base in Abuja, raising Word-cultured ambassadors who carry Christ into every sphere.",
  },
};

// Sourced from the same address/phone/schedule already shown to visitors on
// the Contact page and in the Footer — nothing here is invented. Closing
// times are deliberately omitted rather than guessed; schema.org does not
// require them.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Church",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/Logo.png`,
  image: `${SITE_URL}/Logo.png`,
  description:
    "A worshipping, praying, Kingdom focused global movement with a home base in Abuja, committed to raising Word-cultured ambassadors who carry Christ into every sphere.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Guzape Hills, Asokoro Extension",
    addressLocality: "Abuja",
    addressCountry: "NG",
  },
  telephone: "+234-803-400-7867",
  email: "support@theecclesiaembassy.org",
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "08:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Tuesday", opens: "17:30" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Thursday", opens: "09:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "17:30" },
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
      {/* The default brand field. Individual destinations re-declare
          `data-brand` on their own root to shift the whole page's palette. */}
      <body data-brand="embassy" className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
           
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AuthProvider>
          <ToastProvider>
            <a href="#main-content" className="skip-link">
              Skip to content
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
