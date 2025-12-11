/**
 * Search Engine Indexing Service
 * Notifies search engines when content is updated via IndexNow API
 */

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";
const BASE_URL = process.env.BASE_URL || "https://goranee.ir";
const INDEXNOW_API_KEY = process.env.INDEXNOW_API_KEY; // Optional but recommended

/**
 * Notify search engines (Bing, Yandex, etc.) via IndexNow API when URLs are updated
 * @param urls Array of URLs to notify about
 * @returns Promise that resolves when notification is sent (or fails silently)
 */
export async function notifyIndexNow(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) {
    return;
  }

  // Ensure URLs are absolute
  const absoluteUrls = urls.map((url) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Make relative URLs absolute
    return `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
  });

  try {
    const payload: any = {
      host: new URL(BASE_URL).hostname,
      urlList: absoluteUrls,
    };

    // Add API key if configured
    if (INDEXNOW_API_KEY) {
      payload.key = INDEXNOW_API_KEY;
      payload.keyLocation = `${BASE_URL}/${INDEXNOW_API_KEY}.txt`;
    }

    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(
        `✅ IndexNow notified for ${absoluteUrls.length} URL(s):`,
        absoluteUrls
      );
    } else {
      console.warn(
        `⚠️ IndexNow API returned status ${response.status} for URLs:`,
        absoluteUrls
      );
    }
  } catch (error) {
    // Fail silently - don't block the update operation
    console.error("❌ IndexNow notification error:", error);
  }
}

/**
 * Notify search engines when a song is updated
 * @param songId Song ID
 */
export async function notifySongUpdated(songId: string): Promise<void> {
  const urls = [
    `/tab/${songId}`,
    // Could also notify language-specific URLs if needed
  ];
  await notifyIndexNow(urls);
}

/**
 * Notify search engines when an artist is updated
 * @param artistId Artist ID
 */
export async function notifyArtistUpdated(artistId: string): Promise<void> {
  const urls = [`/artist/${artistId}`];
  await notifyIndexNow(urls);
}

/**
 * Batch notify multiple URLs (useful for bulk updates)
 * @param urls Array of URLs to notify
 */
export async function notifyUrlsUpdated(urls: string[]): Promise<void> {
  await notifyIndexNow(urls);
}
