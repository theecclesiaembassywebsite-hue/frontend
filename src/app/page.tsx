import HeroSection from "@/components/home/HeroSection";
import ServiceSchedule from "@/components/home/ServiceSchedule";
import CITHSection from "@/components/home/CITHSection";
import QuickLinks from "@/components/home/QuickLinks";
import Announcements from "@/components/home/Announcements";
import LatestMessage from "@/components/home/LatestMessage";
import { fetchPublicData } from "@/lib/server-api";

// The home page is built on the server and served from Vercel's cache, so
// visitors don't each call the backend. It is rebuilt at most once per window
// (or sooner via POST /api/revalidate). Must be a literal for Next to read it.
export const revalidate = 60;

export default async function HomePage() {
  const [schedule, announcements] = await Promise.all([
    fetchPublicData<any[]>("/service-schedule", ["service-schedule"]),
    fetchPublicData<any[]>("/announcements", ["announcements"]),
  ]);

  return (
    <>
      <HeroSection />
      <ServiceSchedule initialServices={schedule} />
      <QuickLinks />
      <CITHSection />
      <Announcements initialAnnouncements={announcements} />
      <LatestMessage />
    </>
  );
}
