"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
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

const signupSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError("");
      setLoading(true);

      await auth.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });

      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      if (errorMessage.includes("409") || errorMessage.includes("already exists")) {
        setError("An account with this email already exists");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-1 min-h-screen">
        {/* Left side - Purple gradient */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-dark via-purple to-purple-vivid relative items-center justify-center p-8">
          <div className="absolute inset-0 bg-[rgba(14,0,22,0.4)]" />
          <div className="relative z-10 text-center text-white max-w-md">
            <h1 className="font-heading text-4xl font-bold mb-4">
              The Ecclesia Embassy
            </h1>
            <p className="font-body text-lg text-purple-light leading-relaxed">
              Welcome to the nation. Complete your email verification to get
              started.
            </p>
          </div>
        </div>

        {/* Right side - Success message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">
            <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
              <h3 className="font-heading text-xl font-bold text-success mb-2">
                Account Created!
              </h3>
              <p className="font-body text-sm text-slate mb-6">
                Check your email to verify your account. You'll need to confirm
                your email address before you can sign in.
              </p>
              <Link
                href="/auth/login"
                className="inline-block"
              >
                <Button variant="primary">Return to Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-screen">
      {/* Left side - Purple gradient with branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-dark via-purple to-purple-vivid relative items-center justify-center p-8">
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.4)]" />
        <div className="relative z-10 text-center text-white max-w-md">
          <h1 className="font-heading text-4xl font-bold mb-4">
            The Ecclesia Embassy
          </h1>
          <p className="font-body text-lg text-purple-light mb-8 leading-relaxed">
            Join our spiritual community. Create your account and become part of
            the nation of believers.
          </p>
          <div className="space-y-2">
            <p className="font-serif text-sm italic text-purple-light">
              "Where heaven meets earth"
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Mobile branding */}
          <div className="lg:hidden mb-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-purple mb-2">
              The Ecclesia Embassy
            </h2>
            <p className="font-body text-sm text-gray-text">
              Create your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="rounded-[4px] bg-error/10 border border-error/30 p-4">
                <p className="font-body text-sm text-error">{error}</p>
              </div>
            )}

            {/* First name input */}
            <Input
              id="firstName"
              label="First Name"
              type="text"
              placeholder="John"
              error={errors.firstName?.message}
              {...register("firstName")}
            />

            {/* Last name input */}
            <Input
              id="lastName"
              label="Last Name"
              type="text"
              placeholder="Doe"
              error={errors.lastName?.message}
              {...register("lastName")}
            />

            {/* Email input */}
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            {/* Password input */}
            <div>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="password"
                  className="font-body text-sm font-medium text-slate"
                >
                  Password
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

            {/* Sign up button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>

            {/* Sign in link */}
            <p className="text-center font-body text-sm text-gray-text">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-purple-vivid font-medium hover:text-purple transition-colors"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
