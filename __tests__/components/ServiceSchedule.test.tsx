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

// Mirrors DEFAULT_SERVICES in ServiceSchedule.tsx, in render order.
//
// This is a list of names rather than a bare count on purpose. The original
// tests asserted `toHaveLength(4)`, which went red the moment a fifth real
// service (Healing Incense, added 2026-07-01) landed in the component — and
// stayed red for five weeks, because "expected 4, got 5" reads like a flaky
// count and says nothing about what changed. Naming them means a legitimate
// schedule change fails with the actual service name, and an accidental
// duplicate still fails, which is the bug this suite was written for.
const DEFAULT_SERVICE_NAMES = [
  'Word & Life Service',
  'Prayer Service',
  'Worship Service',
  'Healing Incense Service',
  'As Unto The Lord',
]

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Asserts the rendered tabs are exactly `names` — no missing tab, no extra one,
 * and none rendered twice.
 *
 * Every button in this component is a service tab, so the count covers "no
 * extras". The per-name check is anchored (`^…$`) so one service name can't
 * satisfy the assertion by appearing inside another's label, and requiring
 * exactly one match is what catches a service rendered as two tabs.
 */
const expectTabsToBe = (names: string[]) => {
  expect(screen.getAllByRole('button')).toHaveLength(names.length)
  for (const name of names) {
    const matches = screen.getAllByText(new RegExp(`^${escapeRegExp(name)}$`, 'i'))
    expect(matches, `expected exactly one "${name}" tab`).toHaveLength(1)
  }
}

/**
 * Resolves once the BACKEND_SERVICES payload has actually been merged in.
 *
 * The default "As Unto The Lord" has no time; the backend one is 5:30 PM, and
 * the tab label concatenates day + dayLabel + time. So this string can only
 * exist after the fetch resolved and mergeServices ran — which makes it a real
 * synchronisation point rather than a sleep.
 */
const waitForMerge = () =>
  screen.findByText(/1st\s+—\s+3rd\s+of every month\s+5:30 PM/i)

describe('ServiceSchedule', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the default tabs immediately, before the API resolves', () => {
    // Never resolves — simulates slow network
    ;(serviceSchedule.getPublic as Mock).mockReturnValue(new Promise(() => {}))
    render(<ServiceSchedule />)
    expectTabsToBe(DEFAULT_SERVICE_NAMES)
  })

  it('falls back to the default tabs when the API errors', async () => {
    ;(serviceSchedule.getPublic as Mock).mockRejectedValue(new Error('network'))
    render(<ServiceSchedule />)
    // Defaults render synchronously; after rejection they should be unchanged
    await waitFor(() => expectTabsToBe(DEFAULT_SERVICE_NAMES))
  })

  it('merges the backend services over the defaults without duplicating a tab', async () => {
    ;(serviceSchedule.getPublic as Mock).mockResolvedValue(BACKEND_SERVICES)
    render(<ServiceSchedule />)

    // Wait for the merged data specifically, not just for "some tabs".
    //
    // The component renders DEFAULT_SERVICES synchronously, so a bare
    // `waitFor(() => expectTabsToBe(...))` is satisfied by the very first
    // render and returns before the API promise has even resolved — it would
    // pass identically with the merge logic deleted. The backend's "As Unto
    // The Lord" carries a time the default deliberately leaves blank, so that
    // label appearing is proof the payload actually landed.
    await waitForMerge()

    // Every backend service matches a default by name, so each must collapse
    // into one tab rather than rendering alongside the default it replaces.
    expectTabsToBe(DEFAULT_SERVICE_NAMES)
  })

  it('keeps a default service the backend payload omits', async () => {
    // BACKEND_SERVICES has no Healing Incense entry. An admin editing the four
    // services they curate must not silently drop a service the backend simply
    // doesn't know about — the defaults are a floor, not a placeholder.
    ;(serviceSchedule.getPublic as Mock).mockResolvedValue(BACKEND_SERVICES)
    render(<ServiceSchedule />)

    await waitForMerge()

    expect(screen.getAllByText(/^Healing Incense Service$/i)).toHaveLength(1)
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
