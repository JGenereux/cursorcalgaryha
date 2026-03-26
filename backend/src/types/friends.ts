// ─── User profile types ───

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  cookedScore: number; // 0-100: 0 = touching grass, 100 = fully cooked
  postsConsumed: number;
  isMainUser: boolean;
}

// ─── Health bar representation ───

export interface HealthBar {
  currentHealth: number; // 100 - cookedScore
  maxHealth: number; // always 100
  cookedScore: number;
  status: CookedStatus;
}

export type CookedStatus =
  | "touching-grass"   // 0-20
  | "mildly-online"    // 21-40
  | "chronically-online" // 41-60
  | "cooked"           // 61-80
  | "fully-cooked";    // 81-100

// ─── Friend with health bar ───

export interface FriendWithHealth {
  profile: UserProfile;
  healthBar: HealthBar;
}

// ─── Consume request body ───

export interface ConsumeRequestBody {
  postId: string;
}

// ─── API response types ───

export interface MeResponse {
  profile: UserProfile;
  healthBar: HealthBar;
}

export interface FriendsResponse {
  friends: FriendWithHealth[];
}
