import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { serviceSchedule, events } from '@/lib/api'

const json = (body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))

let epoch = 0

describe('public GET cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn(() => json([{ id: 1 }])))
    // The cache is module-level and fake clocks restart at "now", so move each
    // test to a later hour to make earlier tests' entries stale.
    vi.setSystemTime(Date.now() + ++epoch * 3_600_000)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shares one request between concurrent identical public calls', async () => {
    await Promise.all([serviceSchedule.getPublicStrict(), serviceSchedule.getPublicStrict()])
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('serves repeat calls from cache, then refetches after the TTL', async () => {
    await events.getEvents(5, 0).catch(() => {})
    await events.getEvents(5, 0).catch(() => {})
    expect(fetch).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(31_000)
    await events.getEvents(5, 0).catch(() => {})
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('hands each caller its own copy', async () => {
    const a = await serviceSchedule.getPublicStrict()
    a.push({ id: 'mutated' })
    const b = await serviceSchedule.getPublicStrict()
    expect(b).toHaveLength(1)
  })

  it('clears the cache after a write so edits show immediately', async () => {
    await serviceSchedule.getPublicStrict()
    await serviceSchedule.adminUpdate('x', { active: false })
    await serviceSchedule.getPublicStrict()
    expect((fetch as any).mock.calls.filter((c: any[]) => !c[1]?.method || c[1].method === 'GET')).toHaveLength(2)
  })

  it('never caches livestream config', async () => {
    const { livestream } = await import('@/lib/api')
    await livestream.getConfig()
    await livestream.getConfig()
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})

describe('per-user GET cache', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(Date.now() + ++epoch * 3_600_000)
    vi.stubGlobal('fetch', vi.fn(() => json([{ id: 1 }])))
    const { setCacheScope } = await import('@/lib/api')
    setCacheScope(null)
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('does not cache signed-in GETs until the user is known', async () => {
    const { giving } = await import('@/lib/api')
    await giving.getHistory()
    await giving.getHistory()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('caches a signed-in user\'s GETs, then refetches after the window', async () => {
    const { giving, setCacheScope } = await import('@/lib/api')
    setCacheScope('user-a')
    await giving.getHistory()
    await giving.getHistory()
    expect(fetch).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(21_000)
    await giving.getHistory()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('never serves one user\'s cached data to another', async () => {
    const { giving, setCacheScope } = await import('@/lib/api')
    setCacheScope('user-a')
    await giving.getHistory()
    setCacheScope('user-b')
    await giving.getHistory()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('drops the user\'s data on sign-out', async () => {
    const { giving, setCacheScope } = await import('@/lib/api')
    setCacheScope('user-a')
    await giving.getHistory()
    setCacheScope(null)
    setCacheScope('user-a')
    await giving.getHistory()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('caches /auth/me so route changes don\'t re-check it every time', async () => {
    const { auth } = await import('@/lib/api')
    await auth.getMe()
    await auth.getMe()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('never caches messages', async () => {
    const { fetchAPI, setCacheScope } = await import('@/lib/api')
    setCacheScope('user-a')
    await fetchAPI('/nation/messages/conversations')
    await fetchAPI('/nation/messages/conversations')
    expect(fetch).toHaveBeenCalledTimes(2)
  })
})
