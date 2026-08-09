'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import SectionWrapper from '@/components/ui/SectionWrapper';
import SectionIntro from '@/components/ui/SectionIntro';
import Eyebrow from '@/components/ui/Eyebrow';
import MediaFrame from '@/components/ui/MediaFrame';
import { media } from '@/lib/api';
import { SkeletonGroup } from '@/components/ui/Skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/Motion';
import { BookOpen, Download, Search, ShoppingCart, Loader2, ArrowDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';

interface LibraryItem {
  id: string;
  title: string;
  author: string;
  type: string;
  fileUrl?: string;
  coverUrl?: string;
  description?: string;
  price?: number;
  isFree?: boolean;
}

// Survives the round trip to Paystack's hosted checkout and back.
const PENDING_PURCHASE_KEY = 'library:pendingPurchase';

const ALL_TYPES = 'all';

function formatType(type?: string) {
  const raw = (type || 'book').replace(/_/g, ' ').toLowerCase();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default function EcclesialibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>(ALL_TYPES);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();

  // Paystack redirects back here with ?reference=... once checkout finishes.
  // Landing on this page is not proof of payment — the backend re-verifies the
  // reference against Paystack, and against what it recorded as owed, before it
  // will hand back a file URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');
    const resourceId = sessionStorage.getItem(PENDING_PURCHASE_KEY);
    if (!reference || !resourceId) return;

    sessionStorage.removeItem(PENDING_PURCHASE_KEY);
    // Drop the reference from the address bar so a refresh doesn't re-run this.
    window.history.replaceState({}, '', window.location.pathname);

    setPurchasingId(resourceId);
    media
      .verifyLibraryPurchase(resourceId, reference)
      .then((result) => {
        success('Payment confirmed. Your download will begin shortly.');
        const link = document.createElement('a');
        link.href = result.fileUrl;
        link.click();
      })
      .catch(() => {
        error(
          `We could not confirm that payment. If you were charged, contact support with reference ${reference}.`,
        );
      })
      .finally(() => setPurchasingId(null));
  }, [success, error]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await media.getLibrary();
        setItems(data || []);
      } catch (err) {
        console.error('Failed to fetch library items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filter chips are derived from whatever the catalogue actually contains,
  // so a new resource type added by an admin shows up without a code change.
  const availableTypes = useMemo(() => {
    const seen = new Set<string>();
    for (const item of items) seen.add((item.type || 'book').toLowerCase());
    return Array.from(seen).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const matchesType =
        activeType === ALL_TYPES || (item.type || 'book').toLowerCase() === activeType;
      if (!matchesType) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) || item.author.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery, activeType]);

  const freeCount = useMemo(
    () => items.filter((i) => i.isFree || !i.price || Number(i.price) === 0).length,
    [items],
  );

  const formatPrice = (price?: number) => {
    if (!price) return '₦0';
    return `₦${Number(price).toLocaleString()}`;
  };

  function scrollToCatalogue() {
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // The server creates the transaction — at its own price, with its own
  // reference — and we redirect to the checkout it returns. The browser states
  // no amount and mints no reference, so there is nothing here for a buyer to
  // tamper with; the price is read from the database on the way out and the
  // settled amount is compared against it on the way back.
  const handlePurchase = async (item: LibraryItem) => {
    if (!isAuthenticated) {
      error('Please sign in to purchase this resource.');
      return;
    }

    setPurchasingId(item.id);
    try {
      const { authorization_url } = await media.initializeLibraryPurchase(item.id);
      // Remember which resource this checkout was for, so the return trip knows
      // what to verify. The reference itself comes back in the callback URL.
      sessionStorage.setItem(PENDING_PURCHASE_KEY, item.id);
      window.location.href = authorization_url;
    } catch (err) {
      setPurchasingId(null);
      error(
        err instanceof Error && err.message
          ? err.message
          : 'We could not start that purchase. Please try again.',
      );
    }
  };

  // Always goes through /download, which re-checks entitlement server-side and
  // returns the url. The previous fallback to `item.fileUrl` on error surfaced
  // whatever the public listing happened to carry; that field is null for priced
  // resources, so it could never have leaked one — but it also meant a genuine
  // "you don't own this" was swallowed into a silent no-op instead of being said.
  const handleDownload = async (item: LibraryItem) => {
    try {
      const result = await media.downloadLibraryResource(item.id);
      if (!result?.downloadUrl) {
        error('That download is not available right now.');
        return;
      }
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = item.title;
      link.click();
    } catch {
      error('We could not start that download. Please try again.');
    }
  };

  return (
    <main data-brand="library" className="min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────
          A reading room rather than a coloured panel. The library is the
          quietest, darkest destination on the site by design. */}
      <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-[image:var(--brand-hero)] py-20 md:py-28">
        <Image
          src="/site/library-shelves.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div aria-hidden="true" className="brand-photo-wash absolute inset-0 -z-10" />
        <div aria-hidden="true" className="brand-orb -left-24 top-8 h-72 w-72" />

        <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-6 md:px-8">
          <div className="max-w-2xl">
            <FadeIn direction="up">
              <Eyebrow>The Ecclesia Library</Eyebrow>
            </FadeIn>

            <FadeIn direction="up" delay={0.08}>
              <h1 className="mt-6 font-heading text-[42px] font-bold leading-[1.02] tracking-tight text-white md:text-6xl lg:text-[68px]">
                Feed your mind right.
              </h1>
            </FadeIn>

            <FadeIn direction="up" delay={0.16}>
              <p className="mt-6 max-w-xl font-body text-[15px] leading-8 text-white/66 md:text-lg">
                Books, bulletins, and ministry materials from The Ecclesia Embassy — some free to
                download, others available to buy and keep.
              </p>
            </FadeIn>

            <FadeIn direction="up" delay={0.24}>
              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  onClick={scrollToCatalogue}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-accent)] px-8 py-3.5 font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-on-accent)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-accent-strong)]"
                >
                  Browse the catalogue <ArrowDown className="h-4 w-4" />
                </button>
                <a
                  href="#app"
                  className="inline-flex items-center rounded-full border border-white/18 px-8 py-3.5 font-heading text-[13px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-colors hover:bg-white/8"
                >
                  Get the App
                </a>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.32}>
              <dl className="mt-14 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10">
                {[
                  { label: 'Resources', value: isLoading ? '—' : String(items.length) },
                  { label: 'Free to read', value: isLoading ? '—' : String(freeCount) },
                  { label: 'Formats', value: isLoading ? '—' : String(availableTypes.length || 1) },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[var(--brand-ink)]/75 px-4 py-4 backdrop-blur-sm">
                    <dt className="font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
                      {stat.label}
                    </dt>
                    <dd className="mt-1.5 font-heading text-xl font-bold text-white">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── ADVERT ── */}
      <SectionWrapper variant="brand-band" hairline>
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <Eyebrow>Explore the library</Eyebrow>
            <h2 className="mt-6 font-heading text-3xl font-bold leading-[1.1] text-white md:text-[42px]">
              Resources for your growth.
            </h2>
            <p className="mt-5 font-body text-[15px] leading-8 text-white/66">
              Discover books, ministry materials, and practical resources available through the
              Ecclesia Library.
            </p>

            <div className="relative mt-9 aspect-[16/5] overflow-hidden rounded-[20px] border border-white/10">
              <Image
                src="/site/library-covers.jpg"
                alt="A shelf of titles published by The Ecclesia Embassy"
                fill
                sizes="(max-width: 1024px) 100vw, 32vw"
                className="object-cover brightness-125"
              />
            </div>
          </div>

          <MediaFrame glow badge="Library">
            <video
              className="h-full w-full object-contain"
              controls
              playsInline
              preload="metadata"
              poster="/ecclesia-library-ad-poster.jpg"
              aria-label="Ecclesia Library advert"
            >
              <source src="/ecclesia-library-ad.mp4" type="video/mp4" />
              Your browser does not support embedded video.
            </video>
          </MediaFrame>
        </div>
      </SectionWrapper>

      {/* ── CATALOGUE ────────────────────────────────────────────────
          Covers lead. Everything else — type, price, action — hangs off
          the cover, the way a bookshop shelf reads. */}
      <SectionWrapper variant="paper" id="catalogue">
        <SectionIntro
          eyebrow="The catalogue"
          title="Browse the shelf"
          description="Search by title or author, or narrow the shelf down to a single kind of resource."
        />

        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate/10 bg-white py-3.5 pl-11 pr-4 font-body text-sm text-slate shadow-sm transition-colors focus:border-[var(--brand-accent)] focus:outline-none"
            />
          </div>

          {availableTypes.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {[ALL_TYPES, ...availableTypes].map((type) => {
                const active = activeType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveType(type)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.14em] transition-colors ${
                      active
                        ? 'border-transparent bg-[var(--brand-ink)] text-white'
                        : 'border-slate/12 bg-white text-gray-text hover:border-[var(--brand-accent-line)] hover:text-slate'
                    }`}
                  >
                    {type === ALL_TYPES ? 'All' : formatType(type)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-12">
          {isLoading ? (
            <SkeletonGroup count={8} variant="card" columns={4} />
          ) : filteredItems.length === 0 ? (
            <div className="brand-card brand-card--static mx-auto max-w-md p-12 text-center">
              <div className="brand-tile mx-auto h-14 w-14">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-heading text-xl font-bold text-slate">Nothing on this shelf</h3>
              <p className="mx-auto mt-2 max-w-xs font-body text-sm text-gray-text">
                No resources match that search. Try a different title, author, or format.
              </p>
            </div>
          ) : (
            <StaggerContainer>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item) => {
                  const isFree = item.isFree || !item.price || Number(item.price) === 0;
                  const isProcessing = purchasingId === item.id;

                  return (
                    <StaggerItem key={item.id}>
                      <article className="brand-card flex h-full flex-col overflow-hidden">
                        {/* Cover */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-[image:var(--brand-band)]">
                          {item.coverUrl ? (
                            // Covers come from arbitrary admin-supplied URLs, so
                            // they bypass next/image's configured remote hosts.
                            <img loading="lazy" decoding="async"
                              src={item.coverUrl}
                              alt={`Cover of ${item.title}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full flex-col justify-between p-5">
                              <span
                                aria-hidden="true"
                                className="h-0.5 w-8 rounded-full"
                                style={{ background: 'var(--brand-accent)' }}
                              />
                              <div>
                                <p className="font-serif text-lg leading-tight text-white/90">
                                  {item.title}
                                </p>
                                <p className="mt-2 font-body text-[11px] uppercase tracking-[0.16em] text-white/55">
                                  {item.author}
                                </p>
                              </div>
                            </div>
                          )}

                          <span
                            className={`absolute right-3 top-3 rounded-full px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.1em] shadow-sm ${
                              isFree
                                ? 'bg-success text-white'
                                : 'bg-[var(--brand-accent)] text-[var(--brand-on-accent)]'
                            }`}
                          >
                            {isFree ? 'Free' : formatPrice(item.price)}
                          </span>
                        </div>

                        {/* Detail */}
                        <div className="flex flex-1 flex-col p-5">
                          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-accent-text)]">
                            {formatType(item.type)}
                          </p>
                          <h3 className="mt-2 font-heading text-[15px] font-bold leading-snug text-slate">
                            {item.title}
                          </h3>
                          <p className="mt-1.5 font-body text-xs text-gray-text">
                            By {item.author}
                          </p>

                          {item.description && (
                            <p className="mt-3 line-clamp-2 font-body text-xs leading-6 text-gray-text">
                              {item.description}
                            </p>
                          )}

                          <div className="mt-auto pt-5">
                            {isFree ? (
                              <button
                                onClick={() => handleDownload(item)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-ink)] px-4 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[var(--brand-accent)] hover:text-[var(--brand-on-accent)]"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </button>
                            ) : (
                              <button
                                onClick={() => handlePurchase(item)}
                                disabled={isProcessing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-accent)] px-4 py-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-on-accent)] transition-colors hover:bg-[var(--brand-accent-strong)] disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    Buy {formatPrice(item.price)}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>
          )}
        </div>
      </SectionWrapper>

      {/* ── APP ── */}
      <SectionWrapper variant="brand-ink" id="app" hairline density="compact">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <Eyebrow>Ecclesia Library App</Eyebrow>
            <h2 className="mt-5 font-heading text-2xl font-bold text-white md:text-[32px]">
              Carry the library everywhere
            </h2>
            <p className="mt-4 max-w-md font-body text-sm leading-7 text-white/58">
              Download the app and access kingdom resources — books, materials, and more — right
              from your pocket.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.ecclesia.app"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 rounded-[18px] border border-white/12 bg-white/8 px-6 py-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-accent-line)] hover:bg-white/14 hover:shadow-xl"
            >
              <svg className="h-8 w-8 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.18 23.76a2 2 0 01-.68-.88V1.12A2 2 0 012.5 1L14.09 12 3.18 23.76z" fill="#EA4335" />
                <path d="M17.96 15.9L4.23 23.97l-.13.07 9.99-11.04 3.87 2.9z" fill="#FBBC04" />
                <path d="M21.5 11.11c.31.44.5.96.5 1.52v-.26c0 .54-.17 1.04-.47 1.46l-3.57 2.07-3.87-2.9L17.93 9l3.57 2.11z" fill="#4285F4" />
                <path d="M4.1.03L17.93 9 14.09 12 2.5 1a2 2 0 011.6-.97z" fill="#34A853" />
              </svg>
              <div className="text-left">
                <p className="font-body text-[10px] uppercase tracking-[0.12em] text-white/60">Get it on</p>
                <p className="font-heading text-[15px] font-bold text-white">Google Play</p>
              </div>
            </a>

            <a
              href="https://apps.apple.com/za/app/ecclesia-library/id6753295575"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3.5 rounded-[18px] border border-white/12 bg-white/8 px-6 py-4 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-accent-line)] hover:bg-white/14 hover:shadow-xl"
            >
              <svg className="h-8 w-8 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <p className="font-body text-[10px] uppercase tracking-[0.12em] text-white/60">Download on the</p>
                <p className="font-heading text-[15px] font-bold text-white">App Store</p>
              </div>
            </a>
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
