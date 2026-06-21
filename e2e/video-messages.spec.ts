import { expect, test } from "@playwright/test";

const FIRST_VIDEO_ID = "vid123abc45";
const SECOND_VIDEO_ID = "vid678def90";

test.describe("Video Messages page", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/sermons/video", async (route) => {
      await route.fulfill({
        json: [
          {
            id: FIRST_VIDEO_ID,
            title: "The Power of Consecration",
            youtubeUrl: `https://www.youtube.com/watch?v=${FIRST_VIDEO_ID}`,
            publishedAt: "2026-05-18T18:00:00.000Z",
            speaker: "Brother Victor",
            description: "A manually curated message from the admin library.",
          },
          {
            id: SECOND_VIDEO_ID,
            title: "The Place of Prayer",
            youtubeUrl: `https://www.youtube.com/watch?v=${SECOND_VIDEO_ID}`,
            date: "2026-05-11T18:00:00.000Z",
            speaker: "Sister Grace",
          },
        ],
      });
    });
  });

  test("renders manual video entries as thumbnail cards", async ({ page }) => {
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
    await expect(page.getByText("Brother Victor")).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await expect(page.getByText("The Power of Consecration")).toBeVisible();
    await expect(page.getByText("The Place of Prayer")).toBeVisible();
  });

  test("links each manual card to the matching YouTube watch page", async ({
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

  test("filters the manual entry list with the search bar", async ({ page }) => {
    await page.goto("/resources/video");

    await page
      .getByPlaceholder(/search videos by title/i)
      .fill("Power");

    await expect(page.getByText("The Power of Consecration")).toBeVisible();
    await expect(page.getByText("The Place of Prayer")).toHaveCount(0);
    await expect(page.getByText(/1 video found/i)).toBeVisible();
  });
});
