import { Router, Request, Response } from "express";
import { getPosts, getPostById } from "../db/store";
import { PostsQueryParams, TrendingHashtag, ScoredPost } from "../types/post";

const router = Router();

// ─── GET /api/trends ───

router.get("/trends", (_req: Request, res: Response): void => {
  const posts = getPosts();

  if (posts.length === 0) {
    res.json({ trends: [], lastUpdated: new Date().toISOString() });
    return;
  }

  // Group posts by hashtag
  const hashtagMap = new Map<string, ScoredPost[]>();

  for (const scoredPost of posts) {
    for (const tag of scoredPost.post.hashtags) {
      const normalized = tag.toLowerCase().replace(/^#/, "");
      if (!hashtagMap.has(normalized)) {
        hashtagMap.set(normalized, []);
      }
      hashtagMap.get(normalized)!.push(scoredPost);
    }
  }

  // Build trending hashtags sorted by average brainrot score
  const trends: TrendingHashtag[] = Array.from(hashtagMap.entries())
    .map(([hashtag, hashtagPosts]) => {
      const avgScore =
        hashtagPosts.reduce((sum, p) => sum + p.brainrotScore.total, 0) /
        hashtagPosts.length;

      // Top 3 posts by brainrot score
      const topPosts = [...hashtagPosts]
        .sort((a, b) => b.brainrotScore.total - a.brainrotScore.total)
        .slice(0, 3);

      return {
        hashtag,
        averageBrainrotScore: Math.round(avgScore),
        postCount: hashtagPosts.length,
        topPosts,
      };
    })
    .sort((a, b) => b.averageBrainrotScore - a.averageBrainrotScore);

  res.json({
    trends,
    lastUpdated: new Date().toISOString(),
  });
});

// ─── GET /api/posts ───

router.get("/posts", (req: Request, res: Response): void => {
  const query = req.query as unknown as PostsQueryParams;
  let posts = getPosts();

  // Filter by platform
  if (query.platform) {
    posts = posts.filter((p) => p.post.platform === query.platform);
  }

  // Filter by hashtag
  if (query.hashtag) {
    const normalized = query.hashtag.toLowerCase().replace(/^#/, "");
    posts = posts.filter((p) =>
      p.post.hashtags.some(
        (h) => h.toLowerCase().replace(/^#/, "") === normalized
      )
    );
  }

  // Sort
  const sortBy = query.sortBy ?? "brainrot";
  switch (sortBy) {
    case "brainrot":
      posts.sort((a, b) => b.brainrotScore.total - a.brainrotScore.total);
      break;
    case "date":
      posts.sort(
        (a, b) =>
          new Date(b.post.timestamp).getTime() -
          new Date(a.post.timestamp).getTime()
      );
      break;
    case "views":
      posts.sort((a, b) => b.post.viewsCount - a.post.viewsCount);
      break;
  }

  // Limit
  const limit = query.limit ? Number(query.limit) : 50;
  posts = posts.slice(0, limit);

  res.json({ total: posts.length, posts });
});

// ─── GET /api/posts/:id ───

router.get("/posts/:id", (req: Request, res: Response): void => {
  const postId = req.params.id as string;
  const post = getPostById(postId);

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json(post);
});

export default router;
