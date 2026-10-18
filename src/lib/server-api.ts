import "server-only";

// Server-side reads of public backend data, cached by Next's data cache.
//
// A page that calls this is rendered once per `revalidate` window and served
// from Vercel's cache to everyone else, so visitors don't each hit the backend.
// Only use it for anonymous, identical-for-everyone endpoints: nothing here
// sends credentials, and the cached result is shared across all visitors.

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const DEFAULT_REVALIDATE_SECONDS = 60;

export async function fetchPublicData<T>(
  endpoint: string,
  tags: string[],
  revalidate = DEFAULT_REVALIDATE_SECONDS
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { "X-Client-Platform": "web" },
      next: { revalidate, tags },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // null tells the client component to fetch for itself, as it did before.
    return null;
  }
}
