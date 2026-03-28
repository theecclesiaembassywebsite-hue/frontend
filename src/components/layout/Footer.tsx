import Link from "next/link";

const siteLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Resources", href: "/resources/audio" },
  { label: "Events", href: "/events" },
  { label: "Livestream", href: "/live" },
  { label: "Give", href: "/give" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const joinLinks = [
  { label: "New Here?", href: "/new-here" },
  { label: "Grow with Us", href: "/grow" },
  { label: "Join a Squad", href: "/kingdom/squads" },
  { label: "Find a Hub", href: "/cith" },
  { label: "Ecclesia Nation", href: "/nation" },
  { label: "Prayer Request", href: "/prayer" },
  { label: "Share Testimony", href: "/testimonies" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal py-12">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-base font-bold text-white mb-4">
              The Ecclesia Embassy
            </h3>
            <p className="font-serif text-sm italic text-white/50 leading-relaxed">
              Word, Kingdom and Worship.
              <br />
              Raising Word-cultured Ambassadors.
            </p>
          </div>

          {/* Site Links */}
          <div>
            <h4 className="font-heading text-base font-bold text-white mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-white/20 hover:text-white/60 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Join Us Today */}
          <div>
            <h4 className="font-heading text-base font-bold text-white mb-4">
              Join Us Today
            </h4>
            <ul className="flex flex-col gap-2">
              {joinLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-sm text-white/20 hover:text-white/60 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="font-body text-xs text-white/20 text-center">
            &copy; {year} The Ecclesia Embassy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
