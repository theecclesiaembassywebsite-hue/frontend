"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { auth } from "@/lib/api";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch("email");

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError("");
      setLoading(true);

      await auth.forgotPassword(data.email);
      setSubmitted(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send reset instructions. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-screen items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md">
        {/* Back button */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 mb-8 font-body text-sm text-purple-vivid hover:text-purple transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        {/* Card */}
        <div className="rounded-[8px] bg-white border border-gray-border p-8 shadow-sm">
          {submitted ? (
            <>
              {/* Success state */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-success" />
                  </div>
                </div>
                <h1 className="font-heading text-2xl font-bold text-slate mb-2">
                  Check Your Email
                </h1>
              </div>

              <div className="space-y-4">
                <p className="font-body text-sm text-gray-text text-center">
                  If an account exists with the email{" "}
                  <span className="font-medium text-slate">{email}</span>, we've
                  sent password reset instructions.
                </p>

                <p className="font-body text-xs text-gray-text text-center">
                  The reset link will expire in 24 hours. If you don't see the
                  email in your inbox, check your spam folder.
                </p>

                <Button
                  onClick={() => setSubmitted(false)}
                  variant="secondary"
                  className="w-full mt-6"
                >
                  Try Another Email
                </Button>

                <Link
                  href="/auth/login"
                  className="block"
                >
                  <Button
                    variant="ghost"
                    className="w-full"
                  >
                    Return to Login
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Initial state */}
              <div className="mb-6">
                <h1 className="font-heading text-2xl font-bold text-slate mb-2">
                  Reset Your Password
                </h1>
                <p className="font-body text-sm text-gray-text">
                  Enter your email address and we'll send you instructions to reset
                  your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Error message */}
                {error && (
                  <div className="rounded-[4px] bg-error/10 border border-error/30 p-4">
                    <p className="font-body text-sm text-error">{error}</p>
                  </div>
                )}

                {/* Email input */}
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-6"
                  loading={loading}
                  disabled={loading}
                >
                  Send Reset Instructions
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
