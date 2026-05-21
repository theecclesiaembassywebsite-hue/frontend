import { expect, test } from "@playwright/test";

const FIRST_VIDEO_ID = "vid123abc45";
const SECOND_VIDEO_ID = "vid678def90";
const MANUAL_VIDEO_ID = "man321xyz67";

test.describe("Video Messages page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/youtube-channel-videos", async (route) => {
      await route.fulfill({
        json: {
          videos: [
            {
              id: FIRST_VIDEO_ID,
              title: "The Power of Consecration",
              publishedAt: "2026-05-18T18:00:00.000Z",
              thumbnail: `https://i.ytimg.com/vi/${FIRST_VIDEO_ID}/hqdefault.jpg`,
              watchUrl: `https://www.youtube.com/watch?v=${FIRST_VIDEO_ID}`,
            },
            {
              id: SECOND_VIDEO_ID,
              title: "The Place of Prayer",
              publishedAt: "2026-05-11T18:00:00.000Z",
              thumbnail: `https://i.ytimg.com/vi/${SECOND_VIDEO_ID}/hqdefault.jpg`,
              watchUrl: `https://www.youtube.com/watch?v=${SECOND_VIDEO_ID}`,
            },
          ],
        },
      });
    });

    await page.route("**/api/sermons/video", async (route) => {
      await route.fulfill({
        json: [
          {
            id: "manual-entry-1",
            title: "A Manual Curation",
            youtubeUrl: `https://www.youtube.com/watch?v=${MANUAL_VIDEO_ID}`,
            description: "A manually curated message from the admin library.",
            speaker: "Brother Victor",
            createdAt: "2026-05-19T18:00:00.000Z",
          },
        ],
      });
    });
  });

  test("renders YouTube uploads and manual entries as thumbnail cards", async ({ page }) => {
    await page.goto("/resources/video");

    await expect(
      page.getByRole("heading", { name: /video messages/i })
    ).toBeVisible();

    const firstThumbnail = page.getByAltText("The Power of Consecration");

    await expect(firstThumbnail).toBeVisible();
    await expect(firstThumbnail).toHaveAttribute(
      "src",
      `https://i.ytimg.com/vi/${FIRST_VIDEO_ID}/hqdefault.jpg`
    );
    await expect(page.getByAltText("A Manual Curation")).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
  });

  test("links each uploaded card to the matching YouTube watch page", async ({
    page,
  }) => {
    await page.goto("/resources/video");

    const firstCardLink = page.getByRole("link", {
      name: /the power of consecration/i,
    });

    await expect(firstCardLink).toHaveAttribute(
      "href",
      `https://www.youtube.com/watch?v=${FIRST_VIDEO_ID}`
    );
  });

  test("filters the combined videos with the search bar", async ({ page }) => {
    await page.goto("/resources/video");

    await page
      .getByPlaceholder(/search videos by title/i)
      .fill("Manual");

    await expect(page.getByText("A Manual Curation")).toBeVisible();
    await expect(page.getByText("The Power of Consecration")).toHaveCount(0);
    await expect(page.getByText(/1 video found/i)).toBeVisible();
  });
});
