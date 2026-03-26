import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

// ─── Config ───

const VIDEOS_DIR = path.join(__dirname, "..", "..", "temp", "videos");

function ensureVideosDir(): void {
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
}

// ─── Download result type ───

export interface DownloadResult {
  postId: string;
  filePath: string;
  success: boolean;
  error: string | null;
}

// ─── Download a single video ───

export async function downloadVideo(
  videoUrl: string,
  postId: string
): Promise<DownloadResult> {
  ensureVideosDir();

  const ext = ".mp4";
  const filename = `${postId}${ext}`;
  const filePath = path.join(VIDEOS_DIR, filename);

  // Skip if already downloaded
  if (fs.existsSync(filePath)) {
    return { postId, filePath, success: true, error: null };
  }

  try {
    const response = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      return {
        postId,
        filePath,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    if (!response.body) {
      return {
        postId,
        filePath,
        success: false,
        error: "No response body",
      };
    }

    const nodeStream = Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]);
    const fileStream = fs.createWriteStream(filePath);
    await pipeline(nodeStream, fileStream);

    return { postId, filePath, success: true, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { postId, filePath, success: false, error: errorMessage };
  }
}

// ─── Download multiple videos ───

export async function downloadVideos(
  videos: Array<{ videoUrl: string; postId: string }>
): Promise<DownloadResult[]> {
  const results: DownloadResult[] = [];

  for (const { videoUrl, postId } of videos) {
    const result = await downloadVideo(videoUrl, postId);
    results.push(result);
    console.log(
      `[downloader] ${postId}: ${result.success ? "OK" : result.error}`
    );
  }

  return results;
}

// ─── Cleanup temp videos ───

export function cleanupVideos(): void {
  if (fs.existsSync(VIDEOS_DIR)) {
    const files = fs.readdirSync(VIDEOS_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(VIDEOS_DIR, file));
    }
  }
}
