import { BrainrotScore } from "./brainrot";

// ─── Platform enum ───

export type Platform = "instagram" | "tiktok";

// ─── Internal post type (mapped from raw Apify data) ───

export interface Post {
  id: string;
  platform: Platform;
  url: string;
  caption: string | null;
  hashtags: string[];
  ownerUsername: string;
  ownerDisplayName: string | null;
  ownerAvatarUrl: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  videoDuration: number | null;
  timestamp: string;
  musicArtist: string | null;
  musicTitle: string | null;
  isSponsored: boolean;
}

// ─── Scored post (post + brainrot analysis) ───

export interface ScoredPost {
  post: Post;
  brainrotScore: BrainrotScore;
  analyzedAt: string;
  frameCount: number;
  transcriptAvailable: boolean;
}

// ─── Scrape request body ───

export interface ScrapeRequestBody {
  hashtags: string[];
  platforms: Platform[];
  resultsType?: "posts" | "reels";
  resultsLimit?: number;
}

// ─── Trends response ───

export interface TrendingHashtag {
  hashtag: string;
  averageBrainrotScore: number;
  postCount: number;
  topPosts: ScoredPost[];
}

export interface TrendsResponse {
  trends: TrendingHashtag[];
  lastUpdated: string;
}

// ─── Posts query params ───

export interface PostsQueryParams {
  platform?: Platform;
  hashtag?: string;
  sortBy?: "brainrot" | "date" | "views";
  limit?: number;
}
