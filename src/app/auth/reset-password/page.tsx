"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { auth } from "@/lib/api";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
    }
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid reset token");
      return;
    }

    try {
      setError("");
      setLoading(true);

      await auth.resetPassword(token, data.password);

      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      if (errorMessage.includes("400") || errorMessage.includes("404") || errorMessage.includes("invalid") || errorMessage.includes("expired")) {
        setError("This reset link is invalid or has expired. Please request a new one.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="flex flex-1 min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="rounded-[8px] bg-white border border-gray-border p-8 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center">
                <ArrowLeft className="h-6 w-6 text-error" />
              </div>
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate mb-2">
              Invalid Reset Link
            </h1>
            <p className="font-body text-sm text-gray-text mb-6">
              This reset link is invalid or has expired. Please request a new password reset.
            </p>
            <Link href="/auth/forgot-password">
              <Button variant="primary" className="w-full">
                Request New Link
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-1 min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="rounded-[8px] bg-white border border-gray-border p-8 shadow-sm text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate mb-2">
              Password Reset Successful
            </h1>
            <p className="font-body text-sm text-gray-text mb-6">
              Your password has been successfully reset. You can now sign in with your new
              password.
            </p>
            <Link href="/auth/login">
              <Button variant="primary" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-bold text-slate mb-2">
              Create New Password
            </h1>
            <p className="font-body text-sm text-gray-text">
              Enter a new password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="rounded-[4px] bg-error/10 border border-error/30 p-4">
                <p className="font-body text-sm text-error">{error}</p>
              </div>
            )}

            {/* Password input */}
            <div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="font-body text-sm font-medium text-slate"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={`h-12 w-full rounded-[4px] border bg-white px-4 pr-12 font-body text-base text-slate placeholder:text-gray-text transition-colors duration-150 focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none ${
                      errors.password ? "border-error" : "border-gray-border"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-text hover:text-slate transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="font-body text-xs text-error">
                    {errors.password.message}
                  </span>
                )}
              </div>

              {/* Password requirements */}
              <div className="mt-3 space-y-2">
                <p className="font-body text-xs font-medium text-slate">
                  Password requirements:
                </p>
                <ul className="space-y-1 text-xs font-body text-gray-text">
                  <li className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        password && password.length >= 8
                          ? "bg-success"
                          : "bg-gray-border"
                      }`}
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        password && /[A-Z]/.test(password)
                          ? "bg-success"
                          : "bg-gray-border"
                      }`}
                    />
                    At least one uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        password && /[0-9]/.test(password)
                          ? "bg-success"
                          : "bg-gray-border"
                      }`}
                    />
                    At least one number
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm password input */}
            <div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="font-body text-sm font-medium text-slate"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className={`h-12 w-full rounded-[4px] border bg-white px-4 pr-12 font-body text-base text-slate placeholder:text-gray-text transition-colors duration-150 focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none ${
                      errors.confirmPassword
                        ? "border-error"
                        : "border-gray-border"
                    }`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-text hover:text-slate transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="font-body text-xs text-error">
                    {errors.confirmPassword.message}
                  </span>
                )}
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              loading={loading}
              disabled={loading}
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-text">Loading...</p></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
