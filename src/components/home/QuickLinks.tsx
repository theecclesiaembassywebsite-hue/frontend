import SectionWrapper from "@/components/ui/SectionWrapper";
import FeatureCard from "@/components/ui/FeatureCard";

const quickLinks = [
  {
    title: "New Here?",
    subtitle: "Start your journey",
    href: "/new-here",
  },
  {
    title: "Give / Sow",
    subtitle: "Tithes, offerings & seeds",
    href: "/give",
  },
  {
    title: "Grow with Us",
    subtitle: "Deepen your walk",
    href: "/grow",
  },
  {
    title: "Latest Message",
    subtitle: "Watch or listen",
    href: "/resources/video",
  },
  {
    title: "Events",
    subtitle: "What\u2019s happening",
    href: "/events",
  },
  {
    title: "Join a Squad",
    subtitle: "Kingdom Life Squads",
    href: "/kingdom/squads",
  },
];

export default function QuickLinks() {
  return (
    <SectionWrapper variant="off-white" id="quick-links">
      <div className="text-center mb-10">
        <h2 className="font-heading text-[28px] font-bold text-slate leading-9">
          Explore
        </h2>
        <p className="mt-2 font-serif text-lg italic text-gray-text">
          Quick access to everything you need
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <FeatureCard
            key={link.title}
            title={link.title}
            subtitle={link.subtitle}
            href={link.href}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
