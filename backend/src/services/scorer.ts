import OpenAI from "openai";
import {
  BrainrotScore,
  StimulusDensityScore,
  SemanticCoherenceScore,
  CognitiveDepthScore,
  MemeEntropyScore,
  BatchFrameAnalysis,
  TranscriptAnalysis,
} from "../types/brainrot";

// ─── Lazy OpenAI client (created on first use so dotenv has loaded) ───

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ─── Main scoring function ───

export async function computeBrainrotScore(
  frameAnalysis: BatchFrameAnalysis,
  transcript: TranscriptAnalysis
): Promise<BrainrotScore> {
  const stimulusDensity = scoreStimulusDensity(frameAnalysis);
  const semanticCoherence = await scoreSemanticCoherence(
    transcript,
    frameAnalysis
  );
  const cognitiveDepth = scoreCognitiveDepth(transcript);
  const memeEntropy = scoreMemeEntropy(frameAnalysis);

  // Equal weights for all 4 dimensions
  const total = Math.round(
    (stimulusDensity.score +
      semanticCoherence.score +
      cognitiveDepth.score +
      memeEntropy.score) /
      4
  );

  return {
    total,
    stimulusDensity,
    semanticCoherence,
    cognitiveDepth,
    memeEntropy,
  };
}

// ─── 1. Stimulus Density ───

function scoreStimulusDensity(
  analysis: BatchFrameAnalysis
): StimulusDensityScore {
  const frames = analysis.frames;
  if (frames.length === 0) {
    return {
      score: 50,
      visualElementsPerFrame: 0,
      sceneChangeFrequency: 0,
      textOverlayDensity: 0,
    };
  }

  // Average visual elements per frame
  const avgVisualElements =
    frames.reduce((sum, f) => sum + f.visualElementCount, 0) / frames.length;

  // Scene change frequency (changes per frame)
  const sceneChangeFrequency =
    frames.length > 1 ? analysis.sceneChangeCount / (frames.length - 1) : 0;

  // Text overlay density (average text overlays per frame)
  const textOverlayDensity =
    frames.reduce((sum, f) => sum + f.textOverlays.length, 0) / frames.length;

  // Score: more elements, more changes, more text = higher brainrot
  const elementScore = Math.min(100, avgVisualElements * 10);
  const changeScore = Math.min(100, sceneChangeFrequency * 100);
  const textScore = Math.min(100, textOverlayDensity * 30);

  const score = Math.round((elementScore + changeScore + textScore) / 3);

  return {
    score: clamp(score),
    visualElementsPerFrame: Math.round(avgVisualElements * 10) / 10,
    sceneChangeFrequency: Math.round(sceneChangeFrequency * 100) / 100,
    textOverlayDensity: Math.round(textOverlayDensity * 10) / 10,
  };
}

// ─── 2. Semantic Coherence (inverted: low coherence = high brainrot) ───

async function scoreSemanticCoherence(
  transcript: TranscriptAnalysis,
  frameAnalysis: BatchFrameAnalysis
): Promise<SemanticCoherenceScore> {
  const segments = transcript.segments;

  if (segments.length < 2) {
    // Can't measure coherence with < 2 segments, use frame analysis
    const coherenceFromFrames =
      frameAnalysis.overallCoherence === "chaotic"
        ? 80
        : frameAnalysis.overallCoherence === "loosely-connected"
        ? 55
        : 25;

    return {
      score: coherenceFromFrames,
      averageSegmentSimilarity: 0,
      topicCount: 1,
      hasMultiTopicMashup:
        frameAnalysis.overallCoherence === "chaotic",
    };
  }

  // Get embeddings for each segment
  const segmentTexts = segments.map((s) => s.text).filter((t) => t.length > 5);

  let averageSimilarity = 0.5; // default

  if (segmentTexts.length >= 2) {
    try {
      const embeddingResponse = await getOpenAI().embeddings.create({
        model: "text-embedding-3-small",
        input: segmentTexts,
      });

      const embeddings = embeddingResponse.data.map((d) => d.embedding);

      // Compute cosine similarity between consecutive segments
      const similarities: number[] = [];
      for (let i = 0; i < embeddings.length - 1; i++) {
        similarities.push(cosineSimilarity(embeddings[i], embeddings[i + 1]));
      }

      averageSimilarity =
        similarities.reduce((a, b) => a + b, 0) / similarities.length;
    } catch (err) {
      console.error("[scorer] Embedding error:", err);
    }
  }

  // Estimate topic count from similarity drops
  const topicCount = estimateTopicCount(averageSimilarity, segmentTexts.length);

  const hasMultiTopicMashup =
    frameAnalysis.overallCoherence === "chaotic" || topicCount >= 3;

  // Low similarity = high brainrot (invert the scale)
  const score = Math.round((1 - averageSimilarity) * 100);

  return {
    score: clamp(score),
    averageSegmentSimilarity: Math.round(averageSimilarity * 1000) / 1000,
    topicCount,
    hasMultiTopicMashup,
  };
}

// ─── 3. Cognitive Depth (inverted: no depth = high brainrot) ───

function scoreCognitiveDepth(
  transcript: TranscriptAnalysis
): CognitiveDepthScore {
  const { reasoningMarkers, hasNarrativeArc, fullText } = transcript;

  if (fullText.length === 0) {
    return {
      score: 70, // no transcript = probably vibes-only
      reasoningMarkerCount: 0,
      hasNarrativeStructure: false,
      depthClassification: "vibes-only",
    };
  }

  const markerCount = reasoningMarkers.length;
  const wordCount = fullText.split(/\s+/).length;
  const markerDensity = wordCount > 0 ? markerCount / wordCount : 0;

  // Classify depth
  let classification: CognitiveDepthScore["depthClassification"];
  if (markerCount === 0 && !hasNarrativeArc) {
    classification = "vibes-only";
  } else if (markerDensity < 0.02) {
    classification = "surface";
  } else if (markerDensity < 0.05) {
    classification = "moderate";
  } else {
    classification = "educational";
  }

  // Score: less depth = higher brainrot
  const depthScores: Record<string, number> = {
    "vibes-only": 90,
    surface: 65,
    moderate: 35,
    educational: 10,
  };

  const baseScore = depthScores[classification] ?? 50;
  const narrativeBonus = hasNarrativeArc ? -15 : 0;

  return {
    score: clamp(baseScore + narrativeBonus),
    reasoningMarkerCount: markerCount,
    hasNarrativeStructure: hasNarrativeArc,
    depthClassification: classification,
  };
}

// ─── 4. Meme Entropy ───

function scoreMemeEntropy(analysis: BatchFrameAnalysis): MemeEntropyScore {
  const frames = analysis.frames;

  // Collect all detected meme formats
  const allMemeFormats = new Set<string>();
  let totalRemixLayers = 0;
  let ironicFrameCount = 0;

  for (const frame of frames) {
    for (const format of frame.memeFormatsDetected) {
      allMemeFormats.add(format);
    }
    if (frame.hasRemixLayers) totalRemixLayers++;
    if (frame.tone === "ironic" || frame.tone === "absurd") ironicFrameCount++;
  }

  const memeFormatsDetected = Array.from(allMemeFormats);
  const remixLayerCount = totalRemixLayers;
  const hasIronicTone =
    analysis.dominantTone === "ironic" || analysis.dominantTone === "absurd";

  // Ironic ratio among frames
  const ironicRatio = frames.length > 0 ? ironicFrameCount / frames.length : 0;

  // Score components
  const memeFormatScore = Math.min(100, memeFormatsDetected.length * 25);
  const remixScore = Math.min(100, remixLayerCount * 30);
  const ironyScore = ironicRatio * 100;
  const absurdityBonus = analysis.dominantTone === "absurd" ? 20 : 0;

  const score = Math.round(
    (memeFormatScore + remixScore + ironyScore + absurdityBonus) / 3.2
  );

  // Classify absurdity level
  let absurdityLevel: MemeEntropyScore["absurdityLevel"];
  if (score < 25) {
    absurdityLevel = "low";
  } else if (score < 50) {
    absurdityLevel = "medium";
  } else if (score < 75) {
    absurdityLevel = "high";
  } else {
    absurdityLevel = "transcendent";
  }

  return {
    score: clamp(score),
    memeFormatsDetected,
    remixLayerCount,
    hasIronicTone,
    absurdityLevel,
  };
}

// ─── Helpers ───

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

function estimateTopicCount(
  avgSimilarity: number,
  segmentCount: number
): number {
  if (segmentCount <= 1) return 1;
  if (avgSimilarity > 0.8) return 1;
  if (avgSimilarity > 0.6) return 2;
  if (avgSimilarity > 0.4) return 3;
  return Math.min(segmentCount, 5);
}

function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}
