import { Router, Request, Response } from "express";
import { getMainUser, getFriends, updateUserCookedScore } from "../db/store";
import { getPostById } from "../db/store";
import {
  HealthBar,
  CookedStatus,
  FriendWithHealth,
  ConsumeRequestBody,
  MeResponse,
  FriendsResponse,
} from "../types/friends";
import { UserProfile } from "../types/friends";

const router = Router();

// ─── Compute health bar from cooked score ───

function computeHealthBar(cookedScore: number): HealthBar {
  return {
    currentHealth: 100 - cookedScore,
    maxHealth: 100,
    cookedScore,
    status: getCookedStatus(cookedScore),
  };
}

function getCookedStatus(score: number): CookedStatus {
  if (score <= 20) return "touching-grass";
  if (score <= 40) return "mildly-online";
  if (score <= 60) return "chronically-online";
  if (score <= 80) return "cooked";
  return "fully-cooked";
}

// ─── Build friend with health bar ───

function buildFriendWithHealth(profile: UserProfile): FriendWithHealth {
  return {
    profile,
    healthBar: computeHealthBar(profile.cookedScore),
  };
}

// ─── GET /api/me ───

router.get("/me", (_req: Request, res: Response): void => {
  const mainUser = getMainUser();

  if (!mainUser) {
    res.status(404).json({ error: "Main user not found" });
    return;
  }

  const response: MeResponse = {
    profile: mainUser,
    healthBar: computeHealthBar(mainUser.cookedScore),
  };

  res.json(response);
});

// ─── GET /api/friends ───

router.get("/friends", (_req: Request, res: Response): void => {
  const friends = getFriends();

  const response: FriendsResponse = {
    friends: friends
      .map(buildFriendWithHealth)
      .sort((a, b) => b.profile.cookedScore - a.profile.cookedScore),
  };

  res.json(response);
});

// ─── POST /api/consume ───
// Log that the main user consumed a post, updating their cooked score

router.post("/consume", (req: Request, res: Response): void => {
  const body = req.body as ConsumeRequestBody;

  if (!body.postId) {
    res.status(400).json({ error: "postId is required" });
    return;
  }

  const mainUser = getMainUser();
  if (!mainUser) {
    res.status(404).json({ error: "Main user not found" });
    return;
  }

  const scoredPost = getPostById(body.postId);
  if (!scoredPost) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  // Update cooked score based on the post's brainrot score
  updateUserCookedScore(mainUser.id, scoredPost.brainrotScore.total);

  // Return updated profile
  const updatedUser = getMainUser()!;
  const response: MeResponse = {
    profile: updatedUser,
    healthBar: computeHealthBar(updatedUser.cookedScore),
  };

  res.json(response);
});

export default router;
