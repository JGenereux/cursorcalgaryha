export type BrainRegionKey =
  | "frontalLobe"
  | "temporalLobe"
  | "occipitalLobe"
  | "parietalLobe";

export type BrainrotDimensionKey =
  | "cognitiveDepth"
  | "semanticCoherence"
  | "stimulusDensity"
  | "memeEntropy";

export interface BrainDimension {
  id: BrainrotDimensionKey;
  region: BrainRegionKey;
  regionLabel: string;
  dimensionLabel: string;
  score: number;
  jokeLine: string;
  lastUsed: string;
}

export interface BrainStateDefinition {
  id: string;
  minScore: number;
  maxScore: number;
  label: string;
  vibe: string;
  shellClassName: string;
  veinClassName: string;
  brainScale: number;
}

export interface RankDefinition {
  minScore: number;
  maxScore: number;
  title: string;
}

export interface DashboardUser {
  id: string;
  name: string;
  tagLine: string;
  leaderboardRank: number;
  totalCookedScore: number;
  dimensions: BrainDimension[];
}

export interface FriendWardRecord {
  id: string;
  name: string;
  username: string;
  avatarSeed: string;
  totalCookedScore: number;
  postsConsumed: number;
  dimensions: BrainDimension[];
}

export interface RegionCalloutPlacement {
  region: BrainRegionKey;
  lineClassName: string;
  cardClassName: string;
}

export interface SeverityStyle {
  textClassName: string;
  glowClassName: string;
  fillClassName: string;
}

// ─── Content feed types ───

export type Platform = "tiktok" | "instagram";

export interface MockPost {
  id: string;
  platform: Platform;
  creatorUsername: string;
  caption: string;
  thumbnailGradient: string;
  likesCount: number;
  viewsCount: number;
  sharesCount: number;
  sourceUrl: string | null;
}

export interface BrainImpact {
  dimension: BrainrotDimensionKey;
  dimensionLabel: string;
  delta: number;
}

export interface ConsumedPost {
  post: MockPost;
  brainrotScore: number;
  brainImpacts: BrainImpact[];
  consumedAt: string;
}

export interface FriendFeedEntry {
  friendId: string;
  friendName: string;
  friendUsername: string;
  friendAvatarSeed: string;
  consumed: ConsumedPost;
  roastLine: string;
}