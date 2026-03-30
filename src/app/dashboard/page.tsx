'use client'

import { useAuth } from '@/lib/auth-context'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { profile as profileAPI, giving, prayer } from '@/lib/api'
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  ScaleIn,
} from '@/components/ui/Motion'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import {
  User,
  Heart,
  BookOpen,
  Users,
  Clock,
  Gift,
  ChevronRight,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/Skeleton'

interface DashboardStats {
  totalGiving: number
  prayerRequestsCount: number
  hubStatus: string
  enrolledClassesCount: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [profileData, givingData] = await Promise.all([
          profileAPI.getProfile(user?.id || ''),
          giving.getHistory(),
        ])

        setStats({
          totalGiving: givingData.length > 0 ? givingData.length : 0,
          prayerRequestsCount: 0,
          hubStatus: 'Not Joined',
          enrolledClassesCount: 0,
        })
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const firstName = user?.profile?.firstName || 'Friend'
  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const quickActions = [
    {
      label: 'Edit Profile',
      href: '/dashboard/profile',
      icon: User,
    },
    {
      label: 'My Giving History',
      href: '/dashboard/giving',
      icon: Gift,
    },
    {
      label: 'My Prayer Requests',
      href: '/dashboard/prayer',
      icon: Heart,
    },
    {
      label: 'My Hub',
      href: '/dashboard/hub',
      icon: Users,
    },
    {
      label: 'Ecclesia Nation',
      href: '/nation',
      icon: BookOpen,
    },
    {
      label: 'Submit Testimony',
      href: '/testimonies',
      icon: Clock,
    },
  ]

  return (
    <ProtectedRoute>
      <div className="bg-[#F5F5F5] min-h-screen pt-8 pb-16">
        <div className="max-w-[1200px] mx-auto px-4">
          {/* Welcome Header */}
          <FadeIn>
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#241A42] mb-2">
                Welcome back, {firstName}
              </h1>
              <p className="text-[#8A8A8E] text-lg">{formattedDate}</p>
            </div>
          </FadeIn>

          {/* Quick Stats */}
          <div className="mb-12">
            <StaggerContainer>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {/* My Giving Card */}
                <StaggerItem>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#4A1D6E] rounded-full flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-[#8A8A8E] text-sm font-medium mb-2">
                      My Giving
                    </h3>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="text-2xl font-bold text-[#241A42]">
                        ${stats?.totalGiving || 0}
                      </p>
                    )}
                  </div>
                </StaggerItem>

                {/* Prayer Requests Card */}
                <StaggerItem>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#771996] rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-[#8A8A8E] text-sm font-medium mb-2">
                      Prayer Requests
                    </h3>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="text-2xl font-bold text-[#241A42]">
                        {stats?.prayerRequestsCount || 0}
                      </p>
                    )}
                  </div>
                </StaggerItem>

                {/* Hub Status Card */}
                <StaggerItem>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#4A1D6E] rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-[#8A8A8E] text-sm font-medium mb-2">
                      Hub Status
                    </h3>
                    {loading ? (
                      <Skeleton className="h-8 w-32" />
                    ) : (
                      <p className="text-lg font-bold text-[#241A42]">
                        {stats?.hubStatus || 'Not Joined'}
                      </p>
                    )}
                  </div>
                </StaggerItem>

                {/* Classes Card */}
                <StaggerItem>
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#771996] rounded-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-[#8A8A8E] text-sm font-medium mb-2">
                      Classes
                    </h3>
                    {loading ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      <p className="text-2xl font-bold text-[#241A42]">
                        {stats?.enrolledClassesCount || 0}
                      </p>
                    )}
                  </div>
                </StaggerItem>
              </div>
            </StaggerContainer>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-bold text-[#241A42] mb-6">
              Quick Actions
            </h2>
            <StaggerContainer>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const IconComponent = action.icon
                  return (
                    <StaggerItem key={action.href}>
                      <Link href={action.href}>
                        <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#E4E0EF] rounded-lg flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-[#4A1D6E]" />
                              </div>
                              <span className="font-semibold text-[#241A42]">
                                {action.label}
                              </span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-[#8A8A8E]" />
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  )
                })}
              </div>
            </StaggerContainer>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
