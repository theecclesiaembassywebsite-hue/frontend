import { expect, test } from "@playwright/test";

const AUTO_VIDEO_ID = "abc123def45";
const MANUAL_VIDEO_ID = "mnl456ghi78";
const ARCHIVE_VIDEO_ID = "rst901uvw23";
const AUTO_EMBED_URL = `https://www.youtube.com/embed/${AUTO_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
const ARCHIVE_TITLE = "Sunday Worship Replay";
const ARCHIVE_THUMBNAIL_URL = `https://i.ytimg.com/vi/${ARCHIVE_VIDEO_ID}/hqdefault.jpg`;

test.describe("Livestream page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/youtube-live", async (route) => {
      await route.fulfill({
        json: {
          isLive: true,
          videoId: AUTO_VIDEO_ID,
          embedUrl: AUTO_EMBED_URL,
        },
      });
    });

    await page.route("**/api/youtube-videos", async (route) => {
      await route.fulfill({
        json: {
          videos: [
            {
              id: ARCHIVE_VIDEO_ID,
              title: ARCHIVE_TITLE,
              publishedAt: "2026-05-18T18:00:00.000Z",
              thumbnail: ARCHIVE_THUMBNAIL_URL,
            },
          ],
        },
      });
    });

    await page.route("**/api/livestream/config", async (route) => {
      await route.fulfill({
        json: {
          isLive: true,
          embedUrl: `https://www.youtube.com/watch?v=${MANUAL_VIDEO_ID}`,
          nextService: "2030-01-01T08:00",
        },
      });
    });

    await page.route("**/api/service-schedule", async (route) => {
      await route.fulfill({
        json: [
          {
            id: "sun-service",
            day: "Sunday",
            name: "Word & Life Service",
            time: "8:00 AM",
            description: "A gathering around worship, the Word, and life application.",
          },
        ],
      });
    });
  });

  test("prefers the confirmed channel livestream over the manual fallback", async ({ page }) => {
    await page.goto("/live");

    const iframe = page.locator('iframe[title="The Ecclesia Embassy livestream"]');

    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("src", AUTO_EMBED_URL);
    await expect(iframe).not.toHaveAttribute("src", /live_stream\?channel=/);
    await expect(iframe).not.toHaveAttribute("src", new RegExp(MANUAL_VIDEO_ID));
    await expect(page.getByText(/^Live$/)).toBeVisible();
  });

  test("renders previous stream thumbnails from YouTube", async ({ page }) => {
    await page.goto("/live");

    const thumbnail = page.getByAltText(ARCHIVE_TITLE);

    await thumbnail.scrollIntoViewIfNeeded();
    await expect(thumbnail).toBeVisible();
    await expect(thumbnail).toHaveAttribute("src", ARCHIVE_THUMBNAIL_URL);
  });
});
