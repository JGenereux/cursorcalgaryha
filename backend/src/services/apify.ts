import {
  RawInstagramPost,
  RawTikTokPost,
  InstagramScrapeRequest,
  TikTokScrapeRequest,
} from "../types/apify";
import { Post } from "../types/post";

// ─── Config ───

const APIFY_TOKEN = process.env.APIFY_TOKEN ?? "";

const INSTAGRAM_ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items";

const TIKTOK_ACTOR_URL =
  "https://api.apify.com/v2/acts/clockworks~tiktok-hashtag-scraper/run-sync-get-dataset-items";

// ─── Instagram scraping ───

export async function scrapeInstagramHashtags(
  hashtags: string[],
  resultsType: "posts" | "reels" = "posts",
  resultsLimit: number = 10
): Promise<Post[]> {
  const body: InstagramScrapeRequest = {
    hashtags,
    resultsType,
    resultsLimit,
  };

  const response = await fetch(`${INSTAGRAM_ACTOR_URL}?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Instagram Apify scrape failed (${response.status}): ${errorText}`);
  }

  const rawPosts: RawInstagramPost[] = await response.json() as RawInstagramPost[];
  return rawPosts.map(mapInstagramPost);
}

function mapInstagramPost(raw: RawInstagramPost): Post {
  return {
    id: raw.id ?? raw.shortCode ?? `ig-${Date.now()}`,
    platform: "instagram",
    url: raw.url ?? `https://www.instagram.com/p/${raw.shortCode ?? ""}`,
    caption: raw.caption ?? null,
    hashtags: raw.hashtags ?? [],
    ownerUsername: raw.ownerUsername ?? raw.owner?.username ?? "unknown",
    ownerDisplayName: raw.ownerFullName ?? raw.owner?.full_name ?? null,
    ownerAvatarUrl: raw.owner?.profile_pic_url ?? null,
    likesCount: raw.likesCount ?? 0,
    commentsCount: raw.commentsCount ?? 0,
    sharesCount: raw.sharesCount ?? 0,
    viewsCount: raw.videoViewCount ?? raw.videoPlayCount ?? 0,
    videoUrl: raw.videoUrl ?? null,
    thumbnailUrl: raw.displayUrl ?? null,
    videoDuration: raw.videoDuration ?? null,
    timestamp: raw.timestamp ?? new Date().toISOString(),
    musicArtist: raw.musicInfo?.artist_name ?? null,
    musicTitle: raw.musicInfo?.song_name ?? null,
    isSponsored: raw.isSponsored ?? false,
  };
}

// ─── TikTok scraping ───

export async function scrapeTikTokHashtags(
  hashtags: string[],
  resultsPerPage: number = 10
): Promise<Post[]> {
  const body: TikTokScrapeRequest = {
    hashtags,
    resultsPerPage,
  };

  const response = await fetch(`${TIKTOK_ACTOR_URL}?token=${APIFY_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok Apify scrape failed (${response.status}): ${errorText}`);
  }

  const rawPosts: RawTikTokPost[] = await response.json() as RawTikTokPost[];
  return rawPosts.map(mapTikTokPost);
}

function mapTikTokPost(raw: RawTikTokPost): Post {
  return {
    id: raw.id ?? `tt-${Date.now()}`,
    platform: "tiktok",
    url: raw.webVideoUrl ?? "",
    caption: raw.desc ?? null,
    hashtags: raw.hashtags?.map((h) => h.name ?? "") ?? [],
    ownerUsername: raw.author?.uniqueId ?? "unknown",
    ownerDisplayName: raw.author?.nickname ?? null,
    ownerAvatarUrl: raw.author?.avatarThumb ?? null,
    likesCount: raw.stats?.diggCount ?? raw.diggCount ?? 0,
    commentsCount: raw.stats?.commentCount ?? raw.commentCount ?? 0,
    sharesCount: raw.stats?.shareCount ?? raw.shareCount ?? 0,
    viewsCount: raw.stats?.playCount ?? raw.playCount ?? 0,
    videoUrl: raw.video?.downloadAddr ?? raw.video?.playAddr ?? null,
    thumbnailUrl: null,
    videoDuration: raw.video?.duration ?? null,
    timestamp: raw.createTime
      ? new Date(raw.createTime * 1000).toISOString()
      : new Date().toISOString(),
    musicArtist: raw.music?.authorName ?? null,
    musicTitle: raw.music?.title ?? null,
    isSponsored: false,
  };
}
