'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import { auth, setToken } from '@/lib/api';
import { FadeIn, HeroText } from '@/components/ui/Motion';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setUnverifiedEmail(null);
    setResendState('idle');

    try {
      const response = await auth.login(data.email, data.password);
      const token = response.access_token || response.token;

      if (!token) {
        setErrorMessage('Login succeeded but no token received. Please try again.');
        return;
      }

      setToken(token);
      reset();

      const destination =
        response.user?.role === 'ADMIN' || response.user?.role === 'SUPER_ADMIN'
          ? '/admin'
          : '/dashboard';

      window.location.assign(destination);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'An error occurred. Please try again.';

      if (message.includes('401') || /invalid/i.test(message)) {
        setErrorMessage('Invalid email or password');
      } else if (/verify your email/i.test(message)) {
        setErrorMessage(message);
        setUnverifiedEmail(data.email);
      } else {
        setErrorMessage(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendState('sending');
    try {
      await auth.resendVerification(unverifiedEmail);
      setResendState('sent');
    } catch {
      // The endpoint doesn't leak whether it failed for a real reason — treat
      // any error the same as success so we never hint at account existence.
      setResendState('sent');
    }
  };

  return (
    <div className="flex h-screen bg-off-white overflow-hidden">
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0E0B1E 0%, #0E0B1E 50%, #C9A84C 100%)',
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1920&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.6)]" />

        <div className="relative z-10 max-w-sm text-center text-off-white">
          <FadeIn>
            <HeroText className="text-5xl md:text-6xl font-heading font-bold mb-6 text-off-white leading-tight">
              The Ecclesia Embassy
            </HeroText>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-lg font-body text-off-white/90 mb-8 leading-relaxed">
              Welcome to our faith community. Step into a space where spiritual
              growth, connection, and purpose converge.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-base font-serif italic text-off-white/80 leading-relaxed">
              "In community we find strength, in faith we find purpose, in love we
              find home."
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate mb-2">
              The Ecclesia Embassy
            </h1>
            <p className="text-gray-text font-body text-sm">Sign in to your account</p>
          </div>

          <FadeIn>
            <h2 className="hidden lg:block text-3xl font-heading font-bold text-slate mb-2">
              Welcome Back
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="hidden lg:block text-gray-text font-body text-sm mb-8">
              Sign in to continue to your account
            </p>
          </FadeIn>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-md bg-[rgba(231,76,60,0.1)] border border-[rgba(231,76,60,0.3)] p-4"
            >
              <p className="text-error font-body text-sm">{errorMessage}</p>
              {unverifiedEmail && (
                <div className="mt-3">
                  {resendState === 'sent' ? (
                    <p className="text-slate font-body text-sm">
                      If that account needs verifying, a new link is on its way — check your inbox.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendState === 'sending'}
                      className="text-purple hover:text-purple-vivid font-body text-sm font-medium underline disabled:opacity-60"
                    >
                      {resendState === 'sending' ? 'Sending…' : 'Resend verification email'}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          <FadeIn delay={0.2}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-body font-medium text-slate mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-text pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10 border-lavender focus:border-purple-vivid"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs font-body mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-body font-medium text-slate mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-text pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 border-lavender focus:border-purple-vivid"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text hover:text-slate transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-xs font-body mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox {...register('rememberMe')} className="border-lavender" />
                  <span className="text-sm font-body text-gray-text">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-body text-purple hover:text-purple-vivid transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                className="w-full mt-6"
              >
                {isLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-off-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-lavender" />
              <span className="mx-3 font-body text-xs text-gray-text">or continue with</span>
              <div className="flex-1 border-t border-lavender" />
            </div>

            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
              className="flex w-full items-center justify-center gap-3 rounded-[8px] border border-lavender bg-white px-4 py-3 font-body text-sm font-medium text-slate transition-colors hover:bg-off-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </a>
          </FadeIn>

          <FadeIn delay={0.4}>
            <p className="text-center text-gray-text font-body text-sm mt-6">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-purple hover:text-purple-vivid font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
