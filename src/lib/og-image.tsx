import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

let logoDataUrlPromise: Promise<string> | null = null;

// The same square badge used as the site favicon/app icon, reused here so
// social cards carry the real brand mark rather than a re-typeset logotype.
// Cached across calls within a build — every opengraph-image route reads it.
function getLogoDataUrl(): Promise<string> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = readFile(join(process.cwd(), "src/app/icon.png")).then(
      (buf) => `data:image/png;base64,${buf.toString("base64")}`
    );
  }
  return logoDataUrlPromise;
}

interface OgImageOptions {
  eyebrow?: string;
  title: string;
}

/**
 * Builds the JSX tree passed to `next/og`'s ImageResponse. Kept as one
 * shared function so every route's `opengraph-image.tsx` renders the same
 * card with just a different title/eyebrow, instead of 1200x630 layout code
 * copied into each file.
 */
export async function buildOgImageElement({ eyebrow, title }: OgImageOptions) {
  const logo = await getLogoDataUrl();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "linear-gradient(135deg, #1A1530 0%, #0E0B1E 60%, #09071A 100%)",
        fontFamily: "sans-serif",
      }}
    >
      { }
      <img src={logo} width={120} height={120} alt="" style={{ marginBottom: 40 }} />
      {eyebrow ? (
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#C9A84C",
            marginBottom: 20,
          }}
        >
          {eyebrow}
        </div>
      ) : null}
      <div
        style={{
          display: "flex",
          fontSize: 64,
          fontWeight: 700,
          lineHeight: 1.15,
          color: "#FFFFFF",
          maxWidth: 980,
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 40,
          fontSize: 28,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        The Ecclesia Embassy
      </div>
    </div>
  );
}
