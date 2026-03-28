"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { auth, setToken } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      setLoading(true);

      const response = await auth.login(data.email, data.password);

      setToken(response.token);

      if (data.rememberMe) {
        localStorage.setItem("rememberEmail", data.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      router.push("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError("Invalid email or password");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

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
            Welcome back to your spiritual community. Sign in to access your
            account and connect with the nation.
          </p>
          <div className="space-y-2">
            <p className="font-serif text-sm italic text-purple-light">
              "Where heaven meets earth"
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          {/* Mobile branding - only show on small screens */}
          <div className="lg:hidden mb-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-purple mb-2">
              The Ecclesia Embassy
            </h2>
            <p className="font-body text-sm text-gray-text">
              Sign in to your account
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

            {/* Email input */}
            <div>
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

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
                    placeholder="Enter your password"
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
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <Checkbox
                id="rememberMe"
                label="Remember me"
                {...register("rememberMe")}
                checked={rememberMe}
              />
              <Link
                href="/auth/forgot-password"
                className="font-body text-sm text-purple-vivid hover:text-purple transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-6"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>

            {/* Sign up link */}
            <p className="text-center font-body text-sm text-gray-text">
              Don't have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-purple-vivid font-medium hover:text-purple transition-colors"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
