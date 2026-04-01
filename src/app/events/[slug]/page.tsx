"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, Check } from "lucide-react";
import { events } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  capacity?: number;
  registered?: number;
  fee?: number;
  currency?: string;
  isFree?: boolean;
  speakers?: Array<{ name: string; title?: string }>;
  createdAt: string;
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
}

export default function EventDetailPage({ params }: { params: { slug: string } }) {
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>({
    name: "",
    email: "",
    phone: "",
  });
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const data = await events.getEvent(params.slug);
        if (!data) {
          setNotFound(true);
          return;
        }
        setEventData(data);
        // Pre-fill form if authenticated
        if (isAuthenticated && user?.profile) {
          setFormData((prev) => ({
            ...prev,
            email: user?.email || "",
            name: `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim(),
          }));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch event";
        if (message.includes("404") || message.includes("not found")) {
          setNotFound(true);
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.slug, isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);
      if (eventData?.isFree) {
        await events.registerForEvent(eventData.id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
      } else {
        await events.registerAndPay(eventData?.id || params.slug, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        });
      }
      success("Registration successful!");
      setRegistered(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-5 w-5 rounded bg-gray-border animate-pulse" />
            <div className="h-8 w-40 rounded bg-gray-border animate-pulse" />
          </div>
          <SkeletonGroup count={8} />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <Link href="/events" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
            <ArrowLeft size={18} /> Back to Events
          </Link>
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <h1 className="font-heading text-2xl font-bold text-slate mb-2">
              Event Not Found
            </h1>
            <p className="font-body text-base text-gray-text mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/events">
              <Button variant="primary">Back to Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <Link href="/events" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
            <ArrowLeft size={18} /> Back to Events
          </Link>
          <div className="rounded-[8px] border border-error/30 bg-error/10 p-8 text-center">
            <p className="font-body text-base text-error">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!eventData) return null;

  const eventDate = new Date(eventData.date);
  const isFree = eventData.isFree || !eventData.fee || (eventData as any).hasFee === false;

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
        {/* Back link */}
        <Link href="/events" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
          <ArrowLeft size={18} /> Back to Events
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured image */}
            {eventData.imageUrl ? (
              <img
                src={eventData.imageUrl}
                alt={eventData.title}
                className="w-full h-96 object-cover rounded-[8px]"
              />
            ) : (
              <div className="w-full h-96 bg-purple-dark rounded-[8px] flex items-center justify-center">
                <span className="font-body text-sm text-white/20">Event Image</span>
              </div>
            )}

            {/* Event title and meta */}
            <div>
              <h1 className="font-heading text-4xl font-bold text-slate mb-4">
                {eventData.title}
              </h1>

              <div className="space-y-3 font-body text-sm text-gray-text">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-purple flex-shrink-0" />
                  <span>
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-purple flex-shrink-0" />
                  <span>{eventData.location}</span>
                </div>
                {eventData.capacity && (
                  <div className="flex items-center gap-3">
                    <Users size={18} className="text-purple flex-shrink-0" />
                    <span>
                      {eventData.registered || 0} of {eventData.capacity} registered
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-slate mb-4">
                About This Event
              </h2>
              <div className="font-body text-base text-slate leading-relaxed whitespace-pre-wrap">
                {eventData.description}
              </div>
            </div>

            {/* Speakers */}
            {eventData.speakers && eventData.speakers.length > 0 && (
              <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-slate mb-4">
                  Speakers
                </h2>
                <div className="space-y-3">
                  {eventData.speakers.map((speaker, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-light flex-shrink-0">
                        <span className="font-heading text-xs font-bold text-purple">
                          {speaker.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-heading text-sm font-semibold text-slate">
                          {speaker.name}
                        </p>
                        {speaker.title && (
                          <p className="font-body text-xs text-gray-text">
                            {speaker.title}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Registration sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm sticky top-8">
              {registered ? (
                <div className="text-center py-6">
                  <Check className="mx-auto h-12 w-12 text-success mb-3" />
                  <h3 className="font-heading text-lg font-bold text-slate mb-2">
                    Registration Complete!
                  </h3>
                  <p className="font-body text-sm text-gray-text">
                    Check your email for confirmation and event details.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-heading text-lg font-bold text-slate mb-4">
                    Register Now
                  </h2>

                  {/* Fee info */}
                  <div className="mb-6 rounded-[4px] bg-off-white p-4">
                    <p className="font-heading text-xs font-bold uppercase text-gray-text mb-1">
                      Event Fee
                    </p>
                    {isFree ? (
                      <p className="font-heading text-2xl font-bold text-success">
                        Free
                      </p>
                    ) : (
                      <>
                        <p className="font-heading text-2xl font-bold text-purple">
                          {eventData.currency || "₦"}{eventData.fee}
                        </p>
                        <p className="font-body text-xs text-gray-text mt-1">
                          Secure payment via Paystack
                        </p>
                      </>
                    )}
                  </div>

                  {/* Registration form */}
                  <form onSubmit={handleRegister} className="space-y-4">
                    <Input
                      id="name"
                      name="name"
                      label="Full Name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      label="Email Address"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      label="Phone Number"
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    <Button
                      type="submit"
                      variant="giving"
                      className="w-full"
                      disabled={submitting}
                      loading={submitting}
                    >
                      {isFree ? "Register" : "Register & Pay"}
                    </Button>
                  </form>

                  {!isAuthenticated && (
                    <p className="mt-4 font-body text-xs text-gray-text text-center">
                      Not registered?{" "}
                      <Link href="/auth/signup" className="text-purple-vivid hover:underline">
                        Create an account
                      </Link>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
