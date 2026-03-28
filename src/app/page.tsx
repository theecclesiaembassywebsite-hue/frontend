import HeroSection from "@/components/home/HeroSection";
import ServiceSchedule from "@/components/home/ServiceSchedule";
import CITHSection from "@/components/home/CITHSection";
import QuickLinks from "@/components/home/QuickLinks";
import Announcements from "@/components/home/Announcements";
import LatestMessage from "@/components/home/LatestMessage";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServiceSchedule />
      <CITHSection />
      <QuickLinks />
      <Announcements />
      <LatestMessage />
    </>
  );
}
