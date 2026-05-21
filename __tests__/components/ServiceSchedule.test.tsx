import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest'

// Motion components rely on IntersectionObserver + framer-motion internals
// that don't work in jsdom — swap them for transparent wrappers.
vi.mock('@/components/ui/Motion', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/lib/api', () => ({
  serviceSchedule: { getPublic: vi.fn() },
}))

// Import after mocks are registered
import ServiceSchedule from '@/components/home/ServiceSchedule'
import { serviceSchedule } from '@/lib/api'

const BACKEND_SERVICES = [
  { id: 'id1', day: 'Sunday',    name: 'Word & Life Service', time: '8:00 AM',  description: 'desc', order: 1 },
  { id: 'id2', day: 'Tuesday',   name: 'Prayer Service',      time: '5:30 PM',  description: 'desc', order: 2 },
  { id: 'id3', day: 'Friday',    name: 'Worship Service',     time: '5:30 PM',  description: 'desc', order: 3 },
  { id: 'id4', day: '1st — 3rd', name: 'As Unto The Lord',   time: '5:30 PM',  description: 'desc', order: 4,
    dayLabel: 'of every month' },
]

describe('ServiceSchedule', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders 4 default tabs immediately before the API resolves', () => {
    // Never resolves — simulates slow network
    ;(serviceSchedule.getPublic as Mock).mockReturnValue(new Promise(() => {}))
    render(<ServiceSchedule />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
  })

  it('falls back to 4 default tabs when the API errors', async () => {
    ;(serviceSchedule.getPublic as Mock).mockRejectedValue(new Error('network'))
    render(<ServiceSchedule />)
    // Defaults render synchronously; after rejection they should remain 4
    await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(4))
  })

  it('shows exactly 4 tabs when the backend returns the canonical 4 services', async () => {
    ;(serviceSchedule.getPublic as Mock).mockResolvedValue(BACKEND_SERVICES)
    render(<ServiceSchedule />)
    await waitFor(() => expect(screen.getAllByRole('button')).toHaveLength(4))
  })

  it('does not duplicate Worship Service when backend name matches default', async () => {
    ;(serviceSchedule.getPublic as Mock).mockResolvedValue(BACKEND_SERVICES)
    render(<ServiceSchedule />)
    // Should appear exactly once — in the tab button, not also as a second entry
    await waitFor(() => {
      const matches = screen.getAllByText(/^Worship Service$/i)
      expect(matches).toHaveLength(1)
    })
  })

  it('clicking a tab updates the detail card heading', async () => {
    ;(serviceSchedule.getPublic as Mock).mockResolvedValue(BACKEND_SERVICES)
    render(<ServiceSchedule />)
    await waitFor(() => screen.getAllByRole('button'))

    await userEvent.click(screen.getByRole('button', { name: /Prayer Service/i }))

    expect(screen.getByRole('article')).toHaveTextContent('Prayer Service')
  })

  it('clicking Word & Life Service marks it active and shows it in the detail card', async () => {
    ;(serviceSchedule.getPublic as Mock).mockResolvedValue(BACKEND_SERVICES)
    render(<ServiceSchedule />)
    await waitFor(() => screen.getAllByRole('button'))

    const wordLifeBtn = screen.getByRole('button', { name: /Word & Life Service/i })
    await userEvent.click(wordLifeBtn)

    expect(wordLifeBtn).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('article')).toHaveTextContent('Word & Life Service')
  })
})
