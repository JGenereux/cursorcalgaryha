import { Router, Request, Response } from "express";
import { scrapeInstagramHashtags, scrapeTikTokHashtags } from "../services/apify";
import { downloadVideo } from "../services/downloader";
import { extractFrames, extractAudio, cleanupFrames, cleanupAudio } from "../services/frameExtractor";
import { transcribeAudio } from "../services/transcriber";
import { analyzeFrames } from "../services/analyzer";
import { computeBrainrotScore } from "../services/scorer";
import { addPost } from "../db/store";
import { ScrapeRequestBody, Post, ScoredPost, Platform } from "../types/post";

const router = Router();

// ─── POST /api/scrape ───

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const body = req.body as ScrapeRequestBody;

  if (!body.hashtags || body.hashtags.length === 0) {
    res.status(400).json({ error: "hashtags array is required" });
    return;
  }

  const platforms: Platform[] = body.platforms ?? ["instagram", "tiktok"];
  const resultsType = body.resultsType ?? "posts";
  const resultsLimit = body.resultsLimit ?? 5;

  console.log(`[scrape] Starting scrape for hashtags: ${body.hashtags.join(", ")}`);
  console.log(`[scrape] Platforms: ${platforms.join(", ")}, type: ${resultsType}, limit: ${resultsLimit}`);

  const allPosts: Post[] = [];

  // Scrape from each platform
  try {
    if (platforms.includes("instagram")) {
      console.log("[scrape] Scraping Instagram...");
      const igPosts = await scrapeInstagramHashtags(
        body.hashtags,
        resultsType,
        resultsLimit
      );
      allPosts.push(...igPosts);
      console.log(`[scrape] Got ${igPosts.length} Instagram posts`);
    }

    if (platforms.includes("tiktok")) {
      console.log("[scrape] Scraping TikTok...");
      const ttPosts = await scrapeTikTokHashtags(
        body.hashtags,
        resultsLimit
      );
      allPosts.push(...ttPosts);
      console.log(`[scrape] Got ${ttPosts.length} TikTok posts`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[scrape] Scraping error:", message);
    res.status(500).json({ error: `Scraping failed: ${message}` });
    return;
  }

  // Filter to posts with video URLs
  const videoPosts = allPosts.filter((p) => p.videoUrl !== null);
  console.log(`[scrape] ${videoPosts.length}/${allPosts.length} posts have video URLs`);

  // Process each video post through the analysis pipeline
  const scoredPosts: ScoredPost[] = [];

  for (const post of videoPosts) {
    try {
      console.log(`[scrape] Processing ${post.id} (${post.platform})...`);

      const scored = await processPost(post);
      scoredPosts.push(scored);

      // Save to store incrementally
      addPost(scored);

      console.log(`[scrape] ${post.id}: brainrot score = ${scored.brainrotScore.total}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[scrape] Error processing ${post.id}:`, message);
    }
  }

  // Also score posts without videos (image posts) using just caption analysis
  const imagePosts = allPosts.filter((p) => p.videoUrl === null);
  for (const post of imagePosts) {
    try {
      const scored = await processImagePost(post);
      scoredPosts.push(scored);
      addPost(scored);
    } catch (err) {
      console.error(`[scrape] Error processing image post ${post.id}:`, err);
    }
  }

  res.json({
    total: scoredPosts.length,
    posts: scoredPosts,
  });
});

// ─── Full video processing pipeline ───

async function processPost(post: Post): Promise<ScoredPost> {
  // 1. Download the video
  const download = await downloadVideo(post.videoUrl!, post.id);
  if (!download.success) {
    throw new Error(`Download failed: ${download.error}`);
  }

  // 2. Extract frames and audio in parallel
  const [frameResult, audioResult] = await Promise.all([
    extractFrames(download.filePath, post.id),
    extractAudio(download.filePath, post.id),
  ]);

  // 3. Analyze frames with GPT-4o-mini vision
  const frameAnalysis = await analyzeFrames(frameResult.framePaths);

  // 4. Transcribe audio with Whisper
  const transcript = audioResult.success && audioResult.audioPath
    ? await transcribeAudio(audioResult.audioPath)
    : { fullText: "", segments: [], reasoningMarkers: [], hasNarrativeArc: false };

  // 5. Compute brainrot scores
  const brainrotScore = await computeBrainrotScore(frameAnalysis, transcript);

  // 6. Cleanup temp files
  cleanupFrames(post.id);
  cleanupAudio(post.id);

  return {
    post,
    brainrotScore,
    analyzedAt: new Date().toISOString(),
    frameCount: frameResult.framePaths.length,
    transcriptAvailable: transcript.fullText.length > 0,
  };
}

// ─── Image-only post (no video to analyze, score from caption only) ───

async function processImagePost(post: Post): Promise<ScoredPost> {
  const emptyFrameAnalysis = {
    frames: [] as [],
    overallCoherence: "chaotic" as const,
    sceneChangeCount: 0,
    dominantTone: "mixed" as const,
  };

  const captionAnalysis = {
    fullText: post.caption ?? "",
    segments: post.caption
      ? [{ text: post.caption, startTime: 0, endTime: 0 }]
      : [],
    reasoningMarkers: [] as string[],
    hasNarrativeArc: false,
  };

  const brainrotScore = await computeBrainrotScore(
    emptyFrameAnalysis,
    captionAnalysis
  );

  return {
    post,
    brainrotScore,
    analyzedAt: new Date().toISOString(),
    frameCount: 0,
    transcriptAvailable: false,
  };
}

export default router;
