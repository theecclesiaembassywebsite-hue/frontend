"use client";

import { useRouter } from "next/navigation";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Home, Check } from "lucide-react";
import { cith } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";

const dayOptions = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
];

export default function RegisterHubPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { success, error } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const preferredDay = formData.get("day") as string;
      const preferredTime = formData.get("time") as string;

      await cith.applyHub({
        name: (formData.get("address") as string) || "Hub",
        email: "contact@hub.local",
        phone: "0000000000",
      });

      success("Application submitted! Our team will review it shortly.");
      setSubmitted(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Register Your Home as a Hub
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Open your home for fellowship and extend the church into your community
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="mx-auto max-w-lg">
          <div className="text-center mb-8">
            <Home className="mx-auto h-12 w-12 text-purple mb-3" />
            <h2 className="font-heading text-[28px] font-bold text-slate">
              Hub Application
            </h2>
            <p className="mt-2 font-body text-sm text-gray-text">
              Your application will be reviewed by the admin team. Once approved,
              you will receive onboarding resources and training materials.
            </p>
          </div>

          {authLoading ? (
            <div className="text-center py-8">
              <p className="font-body text-sm text-gray-text">Loading...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="rounded-[8px] bg-warning/10 border border-warning/30 p-6 text-center">
              <p className="font-body text-sm text-gray-text mb-4">
                You must be logged in to register a hub.
              </p>
              <a href="/auth/login" className="text-purple-vivid font-heading font-semibold hover:underline">
                Log in to continue
              </a>
            </div>
          ) : submitted ? (
            <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-success">
                Application Submitted!
              </h3>
              <p className="mt-2 font-body text-sm text-gray-text">
                Your application is pending review. You will be notified once it
                has been approved or if additional information is needed.
              </p>
              <Button
                variant="primary"
                className="mt-4"
                onClick={() => setSubmitted(false)}
              >
                Submit Another Application
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input id="address" name="address" label="Home Address" placeholder="Full street address" required />
              <Input id="area" name="area" label="Area / Neighbourhood" placeholder="e.g. Wuse 2" required />
              <Input id="city" name="city" label="City" placeholder="e.g. Abuja" required />
              <Input id="state" name="state" label="State" placeholder="e.g. FCT" required />
              <Select
                id="day"
                name="day"
                label="Preferred Meeting Day"
                options={dayOptions}
                placeholder="Select a day"
                defaultValue=""
                required
              />
              <Input id="time" name="time" label="Preferred Meeting Time" type="time" required />
              <Input id="capacity" name="capacity" label="Estimated Capacity (persons)" type="number" min="3" placeholder="e.g. 10" required />
              <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
