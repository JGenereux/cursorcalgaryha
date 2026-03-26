import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

// ─── Config ───

const FRAMES_DIR = path.join(__dirname, "..", "..", "temp", "frames");
const AUDIO_DIR = path.join(__dirname, "..", "..", "temp", "audio");
const FRAME_INTERVAL_SECONDS = 2;

// ─── Result types ───

export interface FrameExtractionResult {
  postId: string;
  framePaths: string[];
  success: boolean;
  error: string | null;
}

export interface AudioExtractionResult {
  postId: string;
  audioPath: string | null;
  success: boolean;
  error: string | null;
}

// ─── Ensure directories ───

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ─── Extract frames every 2 seconds ───

export async function extractFrames(
  videoPath: string,
  postId: string
): Promise<FrameExtractionResult> {
  const outputDir = path.join(FRAMES_DIR, postId);
  ensureDir(outputDir);

  return new Promise((resolve) => {
    ffmpeg(videoPath)
      .outputOptions([
        `-vf fps=1/${FRAME_INTERVAL_SECONDS}`,
        "-q:v 2", // high quality JPEG
      ])
      .output(path.join(outputDir, "frame_%03d.jpg"))
      .on("end", () => {
        const files = fs
          .readdirSync(outputDir)
          .filter((f) => f.endsWith(".jpg"))
          .sort()
          .map((f) => path.join(outputDir, f));

        console.log(`[frames] ${postId}: extracted ${files.length} frames`);
        resolve({
          postId,
          framePaths: files,
          success: true,
          error: null,
        });
      })
      .on("error", (err: Error) => {
        console.error(`[frames] ${postId}: error - ${err.message}`);
        resolve({
          postId,
          framePaths: [],
          success: false,
          error: err.message,
        });
      })
      .run();
  });
}

// ─── Extract audio track ───

export async function extractAudio(
  videoPath: string,
  postId: string
): Promise<AudioExtractionResult> {
  ensureDir(AUDIO_DIR);
  const audioPath = path.join(AUDIO_DIR, `${postId}.mp3`);

  // Skip if already extracted
  if (fs.existsSync(audioPath)) {
    return { postId, audioPath, success: true, error: null };
  }

  return new Promise((resolve) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .output(audioPath)
      .on("end", () => {
        console.log(`[audio] ${postId}: extracted audio`);
        resolve({ postId, audioPath, success: true, error: null });
      })
      .on("error", (err: Error) => {
        console.error(`[audio] ${postId}: error - ${err.message}`);
        resolve({ postId, audioPath: null, success: false, error: err.message });
      })
      .run();
  });
}

// ─── Cleanup temp frames and audio ───

export function cleanupFrames(postId: string): void {
  const dir = path.join(FRAMES_DIR, postId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

export function cleanupAudio(postId: string): void {
  const audioPath = path.join(AUDIO_DIR, `${postId}.mp3`);
  if (fs.existsSync(audioPath)) {
    fs.unlinkSync(audioPath);
  }
}
