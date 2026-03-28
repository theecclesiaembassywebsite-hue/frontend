import SectionWrapper from "@/components/ui/SectionWrapper";
import { Calendar } from "lucide-react";

const services = [
  {
    day: "Sunday",
    name: "Word & Life Service",
    time: "9:00 AM",
    description: "Our flagship gathering for the Word and life application.",
  },
  {
    day: "Tuesday",
    name: "Prayer & Intercession",
    time: "6:00 PM",
    description: "A time of corporate prayer and spiritual warfare.",
  },
  {
    day: "Friday",
    name: "Worship Encounter",
    time: "6:00 PM",
    description: "An evening of deep worship and encounter with God.",
  },
  {
    day: "1st — 3rd of Every Month",
    name: "As Unto The Lord",
    time: "6:00 AM & 6:00 PM",
    description:
      "Special consecration services held the first three days of every month.",
  },
];

export default function ServiceSchedule() {
  return (
    <SectionWrapper variant="dark-slate" id="services">
      <div className="text-center mb-10">
        <h2 className="font-heading text-[28px] font-bold text-white leading-9">
          Service Schedule
        </h2>
        <p className="mt-2 font-serif text-lg italic text-off-white">
          Join us in fellowship
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <div
            key={service.name}
            className="flex flex-col items-center rounded-[8px] bg-white/5 p-6 text-center backdrop-blur-sm"
          >
            <Calendar className="mb-3 h-8 w-8 text-purple-vivid" />
            <h5 className="font-heading text-base font-bold text-white">
              {service.day}
            </h5>
            <h3 className="mt-1 font-heading text-lg font-bold text-white">
              {service.name}
            </h3>
            <p className="mt-1 font-heading text-sm font-semibold text-purple-light">
              {service.time}
            </p>
            <p className="mt-2 font-body text-sm text-white/60 leading-relaxed">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
