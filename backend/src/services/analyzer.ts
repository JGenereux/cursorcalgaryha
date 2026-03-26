import OpenAI from "openai";
import fs from "fs";
import { BatchFrameAnalysis, FrameAnalysis } from "../types/brainrot";

// ─── Lazy OpenAI client (created on first use so dotenv has loaded) ───

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ─── Max frames to send per batch (keep token costs low) ───

const MAX_FRAMES_PER_BATCH = 5;

// ─── Analyze a batch of frames using GPT-4o-mini vision ───

export async function analyzeFrames(
  framePaths: string[]
): Promise<BatchFrameAnalysis> {
  if (framePaths.length === 0) {
    return getEmptyAnalysis();
  }

  // Sample frames evenly if more than max batch size
  const sampled = sampleFrames(framePaths, MAX_FRAMES_PER_BATCH);

  // Build image content parts
  const imageContents: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
    sampled.map((fp) => {
      const base64 = fs.readFileSync(fp).toString("base64");
      return {
        type: "image_url" as const,
        image_url: {
          url: `data:image/jpeg;base64,${base64}`,
          detail: "low" as const, // cheaper, sufficient for brainrot analysis
        },
      };
    });

  const prompt = buildAnalysisPrompt(sampled.length);

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: prompt }, ...imageContents],
        },
      ],
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as RawAnalysisResponse;
    return mapToAnalysis(parsed, sampled.length);
  } catch (err) {
    console.error("[analyzer] GPT-4o-mini vision error:", err);
    return getEmptyAnalysis();
  }
}

// ─── Prompt for the vision model ───

function buildAnalysisPrompt(frameCount: number): string {
  return `You are analyzing ${frameCount} frames extracted every 2 seconds from a short-form social media video.

Analyze these frames and return a JSON object with this exact structure:
{
  "frames": [
    {
      "frameIndex": <number>,
      "visualElementCount": <number of distinct visual elements: text overlays, people, objects, effects, stickers>,
      "textOverlays": [<list of any text visible on screen>],
      "memeFormatsDetected": [<known meme formats like "subway surfers gameplay", "family guy clip", "minecraft parkour", "reaction overlay", "duet", "greenscreen", "POV", etc>],
      "sceneDescription": "<brief description of what's happening>",
      "tone": "<ironic|sincere|absurd|mixed>",
      "contentType": "<educational|entertainment|meme|random|advertisement>",
      "hasRemixLayers": <true if picture-in-picture, split screen, reaction overlay, etc>,
      "remixDescription": "<describe the remix layers or null>"
    }
  ],
  "overallCoherence": "<coherent|loosely-connected|chaotic>",
  "sceneChangeCount": <number of distinct scene changes between frames>,
  "dominantTone": "<ironic|sincere|absurd|mixed>"
}

For each frame, analyze it independently. Count all visual elements you can see. Detect any meme formats. Be specific about text overlays.
The "sceneChangeCount" should reflect how many times the visual scene completely changes between consecutive frames.
Return ONLY valid JSON, no markdown.`;
}

// ─── Raw response type from GPT ───

interface RawFrameResponse {
  frameIndex?: number;
  visualElementCount?: number;
  textOverlays?: string[];
  memeFormatsDetected?: string[];
  sceneDescription?: string;
  tone?: string;
  contentType?: string;
  hasRemixLayers?: boolean;
  remixDescription?: string | null;
}

interface RawAnalysisResponse {
  frames?: RawFrameResponse[];
  overallCoherence?: string;
  sceneChangeCount?: number;
  dominantTone?: string;
}

// ─── Map raw response to typed analysis ───

function mapToAnalysis(
  raw: RawAnalysisResponse,
  frameCount: number
): BatchFrameAnalysis {
  const frames: FrameAnalysis[] = (raw.frames ?? []).map((f, i) => ({
    frameIndex: f.frameIndex ?? i,
    visualElementCount: f.visualElementCount ?? 0,
    textOverlays: f.textOverlays ?? [],
    memeFormatsDetected: f.memeFormatsDetected ?? [],
    sceneDescription: f.sceneDescription ?? "",
    tone: validateTone(f.tone),
    contentType: validateContentType(f.contentType),
    hasRemixLayers: f.hasRemixLayers ?? false,
    remixDescription: f.remixDescription ?? null,
  }));

  return {
    frames,
    overallCoherence: validateCoherence(raw.overallCoherence),
    sceneChangeCount: raw.sceneChangeCount ?? 0,
    dominantTone: validateTone(raw.dominantTone),
  };
}

// ─── Validation helpers ───

type Tone = "ironic" | "sincere" | "absurd" | "mixed";
type ContentType = "educational" | "entertainment" | "meme" | "random" | "advertisement";
type Coherence = "coherent" | "loosely-connected" | "chaotic";

function validateTone(value: string | undefined): Tone {
  const valid: Tone[] = ["ironic", "sincere", "absurd", "mixed"];
  return valid.includes(value as Tone) ? (value as Tone) : "mixed";
}

function validateContentType(value: string | undefined): ContentType {
  const valid: ContentType[] = ["educational", "entertainment", "meme", "random", "advertisement"];
  return valid.includes(value as ContentType) ? (value as ContentType) : "random";
}

function validateCoherence(value: string | undefined): Coherence {
  const valid: Coherence[] = ["coherent", "loosely-connected", "chaotic"];
  return valid.includes(value as Coherence) ? (value as Coherence) : "chaotic";
}

// ─── Sample frames evenly from array ───

function sampleFrames(paths: string[], maxCount: number): string[] {
  if (paths.length <= maxCount) return paths;

  const step = paths.length / maxCount;
  const sampled: string[] = [];
  for (let i = 0; i < maxCount; i++) {
    const index = Math.min(Math.floor(i * step), paths.length - 1);
    sampled.push(paths[index]);
  }
  return sampled;
}

// ─── Empty analysis fallback ───

function getEmptyAnalysis(): BatchFrameAnalysis {
  return {
    frames: [],
    overallCoherence: "chaotic",
    sceneChangeCount: 0,
    dominantTone: "mixed",
  };
}
