import SectionWrapper from "@/components/ui/SectionWrapper";
import Link from "next/link";
import { MapPin, Globe, Home } from "lucide-react";

const cithCards = [
  {
    icon: MapPin,
    title: "Find a Hub Near You",
    description:
      "Search for a Church-in-the-Home fellowship gathering in your area and join a local community.",
    href: "/cith",
    cta: "Find a Hub",
  },
  {
    icon: Globe,
    title: "Join the e-Hub",
    description:
      "No physical hub nearby? Join our online fellowship community and connect from anywhere in the world.",
    href: "/cith/ehub",
    cta: "Join Online",
  },
  {
    icon: Home,
    title: "Register Your Home as a Hub",
    description:
      "Open your home for fellowship. Apply to become a hub host and extend the church into your community.",
    href: "/cith/register",
    cta: "Apply Now",
  },
];

export default function CITHSection() {
  return (
    <SectionWrapper variant="white" id="cith">
      <div className="text-center mb-10">
        <h2 className="font-heading text-[28px] font-bold text-slate leading-9">
          Church in the Home
        </h2>
        <p className="mt-2 font-serif text-lg italic text-gray-text">
          Extending fellowship beyond the building
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cithCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col items-center rounded-[8px] border border-gray-border p-8 text-center transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-light">
                <Icon className="h-6 w-6 text-purple" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate">
                {card.title}
              </h3>
              <p className="mt-2 font-body text-sm text-gray-text leading-relaxed">
                {card.description}
              </p>
              <span className="mt-4 text-button text-purple-vivid group-hover:underline">
                {card.cta}
              </span>
            </Link>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
