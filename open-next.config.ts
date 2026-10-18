import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

// Without these, the Worker has no place to keep a rendered page or a tag's
// revalidation time, so `revalidate = 60` pages and POST /api/revalidate
// (revalidateTag) have nothing to act on. KV bindings are in wrangler.jsonc.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: kvNextTagCache,
  // Regenerate stale pages inside the request instead of via a queue binding.
  queue: "direct",
});
