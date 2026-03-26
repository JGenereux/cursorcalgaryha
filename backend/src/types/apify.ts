// ─── Raw Apify Instagram Hashtag Scraper response types ───

interface RawInstagramOwner {
  id?: string;
  username?: string;
  full_name?: string;
  profile_pic_url?: string;
  is_verified?: boolean;
}

interface RawInstagramLocation {
  id?: string;
  name?: string;
  slug?: string;
}

interface RawInstagramChildPost {
  id?: string;
  display_url?: string;
  is_video?: boolean;
  video_url?: string;
}

interface RawInstagramMusicInfo {
  artist_name?: string;
  song_name?: string;
  uses_original_audio?: boolean;
}

export interface RawInstagramPost {
  id?: string;
  shortCode?: string;
  url?: string;
  type?: string;
  caption?: string;
  hashtags?: string[];
  mentions?: string[];
  commentsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  videoDuration?: number;
  videoUrl?: string;
  displayUrl?: string;
  dimensionsHeight?: number;
  dimensionsWidth?: number;
  timestamp?: string;
  ownerUsername?: string;
  ownerFullName?: string;
  ownerId?: string;
  isSponsored?: boolean;
  locationName?: string;
  locationId?: string;
  childPosts?: RawInstagramChildPost[];
  musicInfo?: RawInstagramMusicInfo;
  owner?: RawInstagramOwner;
  location?: RawInstagramLocation;
  inputUrl?: string;
}

// ─── Raw Apify TikTok Hashtag Scraper response types ───

interface RawTikTokAuthor {
  id?: string;
  uniqueId?: string;
  nickname?: string;
  avatarThumb?: string;
  verified?: boolean;
}

interface RawTikTokMusic {
  id?: string;
  title?: string;
  authorName?: string;
  original?: boolean;
}

interface RawTikTokStats {
  diggCount?: number;
  shareCount?: number;
  commentCount?: number;
  playCount?: number;
}

interface RawTikTokVideo {
  id?: string;
  duration?: number;
  downloadAddr?: string;
  playAddr?: string;
}

export interface RawTikTokPost {
  id?: string;
  desc?: string;
  createTime?: number;
  video?: RawTikTokVideo;
  author?: RawTikTokAuthor;
  music?: RawTikTokMusic;
  stats?: RawTikTokStats;
  hashtags?: RawTikTokHashtag[];
  webVideoUrl?: string;
  diggCount?: number;
  shareCount?: number;
  commentCount?: number;
  playCount?: number;
}

interface RawTikTokHashtag {
  id?: string;
  name?: string;
}

// ─── Apify API request body types ───

export interface InstagramScrapeRequest {
  hashtags: string[];
  resultsType?: "posts" | "reels";
  resultsLimit?: number;
}

export interface TikTokScrapeRequest {
  hashtags: string[];
  resultsPerPage?: number;
}
