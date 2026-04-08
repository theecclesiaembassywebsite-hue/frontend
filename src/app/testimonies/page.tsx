'use client'

import SectionWrapper from '@/components/ui/SectionWrapper'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import { testimonies } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/ui/Toast'
import { FadeIn } from '@/components/ui/Motion'
import Link from 'next/link'
import { Sparkles, CheckCircle } from 'lucide-react'
import { useState } from 'react'

export default function TestimoniesPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreeToShare, setAgreeToShare] = useState(false)
  const { isAuthenticated } = useAuth()
  const { success, error } = useToast()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!isAuthenticated) {
      error('Please sign in to submit a testimony.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      await testimonies.submitTestimony({
        title: formData.get('title') as string,
        content: formData.get('testimony') as string,
        isPublic: agreeToShare,
      })
      success('Your testimony has been received.')
      setSubmitted(true)
      ;(e.target as HTMLFormElement).reset()
      setAgreeToShare(false)
    } catch (err) {
      error(
        err instanceof Error
          ? err.message
          : 'Failed to submit testimony. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section
        className="relative flex items-center justify-center py-24 md:py-32 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-[rgba(36, 26, 66, 0.75)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Share Your Testimony
          </h1>
          <p className="mt-3 font-serif text-lg font-light text-[#F5F5F5]">
            Celebrate what God has done
          </p>
        </div>
      </section>

      {/* Testimony Form */}
      <SectionWrapper variant="white">
        <FadeIn>
          <div className="mx-auto max-w-xl">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-16 w-16 text-[#27AE60] mb-6" />
                <h3 className="font-heading text-2xl font-bold text-[#241A42] mb-2">
                  Your testimony has been received
                </h3>
                <p className="font-body text-[#8A8A8E] mb-8">
                  Thank you for sharing. We will review and celebrate your story.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#4A1D6E] text-white rounded-lg font-semibold hover:bg-[#771996] transition-colors"
                >
                  Back to Home
                </a>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="font-heading text-3xl font-bold text-[#241A42]">
                    Share Your Testimony
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <Input
                    id="fullName"
                    name="fullName"
                    label="Full Name"
                    placeholder="Enter your name"
                    required
                  />
                  <Input
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                  <Input
                    id="title"
                    name="title"
                    label="Title of Testimony"
                    placeholder="Give your testimony a title"
                    required
                  />
                  <Select
                    id="category"
                    name="category"
                    label="Category"
                    required
                    options={[
                      { value: 'healing', label: 'Healing' },
                      { value: 'salvation', label: 'Salvation' },
                      { value: 'provision', label: 'Provision' },
                      { value: 'breakthrough', label: 'Breakthrough' },
                      { value: 'deliverance', label: 'Deliverance' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="testimony"
                      className="font-body text-sm font-medium text-[#31333B]"
                    >
                      Your Testimony
                    </label>
                    <textarea
                      id="testimony"
                      name="testimony"
                      className="h-48 w-full rounded-lg border border-[#31333B] bg-white px-4 py-3 font-body text-base text-[#31333B] placeholder:text-[#8A8A8E] transition-colors duration-150 focus:border-[#771996] focus:ring-3 focus:ring-[#771996]/15 focus:outline-none resize-none"
                      placeholder="Share what God has done in your life..."
                      required
                    />
                  </div>
                  <Checkbox
                    id="agreeToShare"
                    label="Share my testimony publicly (optional)"
                    checked={agreeToShare}
                    onChange={() => setAgreeToShare(!agreeToShare)}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Testimony'}
                  </Button>

                  {!isAuthenticated && (
                    <p className="text-center font-body text-sm text-[#8A8A8E] mt-4">
                      Please{' '}
                      <Link href="/auth/login" className="text-[#771996] hover:underline font-semibold">
                        sign in
                      </Link>{' '}
                      to submit your testimony.
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </FadeIn>
      </SectionWrapper>
    </>
  )
}
