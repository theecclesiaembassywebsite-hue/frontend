"use client";

import { useRouter } from "next/navigation";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { Globe, Target, BookOpen, Check } from "lucide-react";
import { squads } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";

export default function KIPPage() {
  const [registered, setRegistered] = useState(false);
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
      await squads.registerKIP({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
      });
      success("Welcome to the Kingdom Influencing Platform!");
      setRegistered(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      error(err instanceof Error ? err.message : "Failed to register. Please try again.");
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
            Kingdom Influencing Platform
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Advancing the Kingdom across every sphere of influence
          </h6>
        </div>
      </section>

      <SectionWrapper variant="white">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-10">
          {[
            { icon: Globe, title: "Spheres of Influence", desc: "Marketplace, governance, education, media, arts, family, and ministry." },
            { icon: Target, title: "Our Mission", desc: "To position believers as kingdom agents in strategic sectors of society." },
            { icon: BookOpen, title: "Resources", desc: "Training materials, mentorship, and practical tools for kingdom influence." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <Icon className="mx-auto h-8 w-8 text-purple mb-3" />
                <h3 className="font-heading text-base font-bold text-slate">{item.title}</h3>
                <p className="mt-2 font-body text-sm text-gray-text">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-heading text-[28px] font-bold text-white mb-6">Join the Platform</h2>
          {authLoading ? (
            <div className="text-center py-8">
              <p className="font-body text-sm text-white/70">Loading...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="rounded-[8px] bg-white/10 p-6">
              <p className="font-body text-sm text-white/70 mb-4">
                You must be logged in to join the Kingdom Influencing Platform.
              </p>
              <a href="/auth/login" className="text-purple-light font-heading font-semibold hover:underline">
                Log in to continue
              </a>
            </div>
          ) : registered ? (
            <div className="rounded-[8px] bg-white/10 p-8">
              <Check className="mx-auto h-10 w-10 text-success mb-3" />
              <h3 className="font-heading text-lg font-bold text-white">Welcome Aboard!</h3>
              <p className="mt-2 font-body text-sm text-white/70">You have been registered for the Kingdom Influencing Platform.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input id="name" name="name" placeholder="Full Name" required />
              <Input id="email" name="email" type="email" placeholder="Email Address" required />
              <Input id="phone" name="phone" type="tel" placeholder="Phone Number" required />
              <Input id="sphere" name="sphere" placeholder="Sphere of Influence (e.g. Education, Media)" required />
              <Button type="submit" variant="giving" className="w-full" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>
    </>
  );
}
