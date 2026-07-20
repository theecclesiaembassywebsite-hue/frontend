"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import clsx from "clsx";
import SectionWrapper from "@/components/ui/SectionWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/Motion";
import { serviceSchedule } from "@/lib/api";

interface ServiceEntry {
  id?: string;
  day: string;
  dayLabel?: string | null;
  name: string;
  time: string;
  description: string;
  note?: string | null;
  order?: number | null;
  active?: boolean | null;
}

const DEFAULT_SERVICES: ServiceEntry[] = [
  {
    id: "svc-sunday-word-life",
    day: "Sunday",
    name: "Word & Life Service",
    time: "8:00 AM",
    description:
      "Our flagship gathering for worship, the Word, and life application.",
    order: 1,
  },
  {
    id: "svc-tuesday-prayer",
    day: "Tuesday",
    name: "Prayer Service",
    time: "5:30 PM",
    description:
      "A time of corporate prayer, intercession, and spiritual warfare.",
    order: 2,
  },
  {
    id: "svc-friday-worship",
    day: "Friday",
    name: "Worship Service",
    time: "5:30 PM",
    description:
      "An evening of deep worship and encounter in the Lord's presence.",
    order: 3,
  },
  {
    id: "svc-thursday-healing-incense",
    day: "Thursday",
    name: "Healing Incense Service",
    time: "9:00 AM",
    description:
      "A dedicated time of intercession and prophetic ministration for healing and breakthrough.",
    note:
      "The online Healing Incense service holds on the last Thursday of every month. All Healing Incense services start by 9:00am every Thursday.",
    order: 4,
  },
  {
    id: "svc-monthly-as-unto",
    day: "1st to 3rd",
    dayLabel: "of every month",
    name: "As Unto The Lord",
    time: "",
    description:
      "A monthly consecration gathering to begin the month in worship, prayer, and devotion before the Lord.",
    order: 5,
  },
];

const getLookupKey = (name: string) => name.trim().toLowerCase();
const getServiceKey = (service: ServiceEntry) =>
  service.id || getLookupKey(service.name).replace(/[^a-z0-9]+/g, "-");

const getFallbackRank = (service: ServiceEntry) => {
  const index = DEFAULT_SERVICES.findIndex(
    (defaultService) => getLookupKey(defaultService.name) === getLookupKey(service.name)
  );
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const getSlotKey = (service: ServiceEntry) =>
  `${(service.day || "").trim().toLowerCase()}|${(service.time || "").trim().toLowerCase()}`;

const mergeServices = (incoming: ServiceEntry[]) => {
  const merged = new Map<string, ServiceEntry>();

  for (const service of DEFAULT_SERVICES) {
    merged.set(getLookupKey(service.name), service);
  }

  const matchedDefaultKeys = new Set<string>();

  for (const rawService of incoming) {
    if (!rawService?.name) continue;

    const lookupKey = getLookupKey(rawService.name);
    const fallback = merged.get(lookupKey);
    if (fallback) matchedDefaultKeys.add(lookupKey);

    merged.set(lookupKey, {
      ...fallback,
      ...rawService,
      id: rawService.id || fallback?.id,
      day: rawService.day || fallback?.day || "",
      dayLabel: rawService.dayLabel ?? fallback?.dayLabel,
      name: rawService.name || fallback?.name || "",
      time: rawService.time != null ? rawService.time : (fallback?.time ?? ""),
      description: rawService.description || fallback?.description || "",
      note: rawService.note ?? fallback?.note,
      order: rawService.order ?? fallback?.order,
    });
  }

  // A backend entry saved under a different name than its matching default
  // (e.g. an admin created a new record instead of editing the original)
  // still occupies the same day/time slot — drop the stale, unmatched
  // default so the same service doesn't render as two separate tabs.
  const incomingSlots = new Set(
    incoming.filter((s) => s?.name).map(getSlotKey)
  );

  return Array.from(merged.values())
    .filter((service) => {
      const isUnmatchedDefault = !matchedDefaultKeys.has(getLookupKey(service.name))
        && !incoming.some((s) => s?.name && getLookupKey(s.name) === getLookupKey(service.name));
      return !(isUnmatchedDefault && incomingSlots.has(getSlotKey(service)));
    })
    .sort((left, right) => {
      const leftOrder = left.order ?? getFallbackRank(left);
      const rightOrder = right.order ?? getFallbackRank(right);
      return leftOrder !== rightOrder
        ? leftOrder - rightOrder
        : left.name.localeCompare(right.name);
    });
};

function ServiceTabButton({
  service,
  isActive,
  onClick,
}: {
  service: ServiceEntry;
  isActive: boolean;
  onClick: () => void;
}) {
  const hasDayLabel = Boolean(service.dayLabel);

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "min-w-[152px] rounded-[22px] border px-5 py-4 text-center transition-all duration-300",
        "bg-white/[0.04] backdrop-blur-sm",
        isActive
          ? "border-gold/55 bg-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
          : "border-white/[0.12] text-white/82 hover:border-gold/30 hover:bg-white/[0.08]"
      )}
      aria-pressed={isActive}
    >
      <p
        className={clsx(
          "font-heading text-[11px] font-bold uppercase tracking-[0.12em]",
          isActive ? "text-white" : "text-white/86"
        )}
      >
        {service.day}
        {hasDayLabel ? ` ${service.dayLabel}` : ""}
        {service.time ? ` ${service.time}` : ""}
      </p>
      <p
        className={clsx(
          "mt-1 font-body text-xs",
          hasDayLabel
            ? clsx("font-semibold", isActive ? "text-gold" : "text-gold/80")
            : isActive
              ? "text-white/90"
              : "text-white/62"
        )}
      >
        {service.name}
      </p>
    </button>
  );
}

export default function ServiceSchedule() {
  const [services, setServices] = useState<ServiceEntry[]>(DEFAULT_SERVICES);
  const [selectedServiceKey, setSelectedServiceKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedServiceKey(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    serviceSchedule
      .getPublic()
      .then((data) => {
        if (data && data.length > 0) {
          setServices(mergeServices(data as ServiceEntry[]));
        }
      })
      .catch(() => {
        setServices(DEFAULT_SERVICES);
      });
  }, []);

  const activeServiceKey =
    selectedServiceKey !== null &&
    services.some((service) => getServiceKey(service) === selectedServiceKey)
      ? selectedServiceKey
      : null;

  const selectedService = activeServiceKey
    ? services.find((service) => getServiceKey(service) === activeServiceKey)
    : null;

  return (
    <SectionWrapper variant="dark-slate">
      <FadeIn>
        <SectionHeading
          eyebrow="When We Gather"
          title="A steady weekly rhythm of worship, prayer, and formation."
          description="Build your week around the moments where the house gathers to behold Christ, hear the Word, and pray together."
          align="center"
          className="mb-12 [&>p:last-child]:mx-auto [&>p:last-child]:text-white/68"
          titleClassName="text-white"
        />
      </FadeIn>

      <div ref={containerRef}><StaggerContainer className="mx-auto max-w-5xl" staggerDelay={0.08}>
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {services.map((service) => {
            const serviceKey = getServiceKey(service);
            return (
              <StaggerItem key={serviceKey}>
                <ServiceTabButton
                  service={service}
                  isActive={serviceKey === activeServiceKey}
                  onClick={() => setSelectedServiceKey(serviceKey)}
                />
              </StaggerItem>
            );
          })}
        </div>

        {selectedService ? (
          <FadeIn key={activeServiceKey} direction="up" duration={0.45}>
            <article className="overflow-hidden rounded-[30px] border border-white/[0.12] bg-white/[0.07] shadow-[0_24px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm">
              <div className="flex flex-col md:flex-row">
                <div className="flex min-w-[120px] items-center justify-center border-b border-white/[0.1] px-6 py-6 md:border-b-0 md:border-r">
                  <div className="text-center">
                    <p className="font-heading text-xl font-bold text-white">
                      {selectedService.day}
                    </p>
                    {selectedService.dayLabel && (
                      <p className="mt-1 font-body text-[11px] uppercase tracking-[0.18em] text-gold/84">
                        {selectedService.dayLabel}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 px-6 py-6 md:px-7">
                  <h3 className="font-heading text-xl font-bold text-gold md:text-2xl">
                    {selectedService.name}
                  </h3>
                  <p className="mt-3 max-w-2xl font-body text-sm leading-7 text-white/78 md:text-base">
                    {selectedService.description}
                  </p>
                  {selectedService.note && (
                    <p className="mt-3 max-w-2xl font-body text-xs italic leading-6 text-gold/86 md:text-sm">
                      {selectedService.note}
                    </p>
                  )}
                </div>

                {selectedService.time && (
                  <div className="flex items-center border-t border-white/[0.1] px-6 py-5 md:border-t-0 md:border-l">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gold" />
                      <span className="font-heading text-sm font-bold uppercase tracking-[0.08em] text-white">
                        {selectedService.time}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </FadeIn>
        ) : null}
      </StaggerContainer></div>
    </SectionWrapper>
  );
}
