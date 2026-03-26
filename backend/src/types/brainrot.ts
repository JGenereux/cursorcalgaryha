// ─── Brainrot scoring dimension types ───

export interface StimulusDensityScore {
  score: number; // 0-100
  visualElementsPerFrame: number;
  sceneChangeFrequency: number;
  textOverlayDensity: number;
}

export interface SemanticCoherenceScore {
  score: number; // 0-100 (higher = more brainrot = less coherence)
  averageSegmentSimilarity: number; // 0-1 cosine similarity
  topicCount: number;
  hasMultiTopicMashup: boolean;
}

export interface CognitiveDepthScore {
  score: number; // 0-100 (higher = more brainrot = less depth)
  reasoningMarkerCount: number;
  hasNarrativeStructure: boolean;
  depthClassification: "vibes-only" | "surface" | "moderate" | "educational";
}

export interface MemeEntropyScore {
  score: number; // 0-100
  memeFormatsDetected: string[];
  remixLayerCount: number;
  hasIronicTone: boolean;
  absurdityLevel: "low" | "medium" | "high" | "transcendent";
}

export interface BrainrotScore {
  total: number; // 0-100 weighted average
  stimulusDensity: StimulusDensityScore;
  semanticCoherence: SemanticCoherenceScore;
  cognitiveDepth: CognitiveDepthScore;
  memeEntropy: MemeEntropyScore;
}

// ─── Frame analysis types (from GPT-4o-mini vision) ───

export interface FrameAnalysis {
  frameIndex: number;
  visualElementCount: number;
  textOverlays: string[];
  memeFormatsDetected: string[];
  sceneDescription: string;
  tone: "ironic" | "sincere" | "absurd" | "mixed";
  contentType: "educational" | "entertainment" | "meme" | "random" | "advertisement";
  hasRemixLayers: boolean;
  remixDescription: string | null;
}

export interface BatchFrameAnalysis {
  frames: FrameAnalysis[];
  overallCoherence: "coherent" | "loosely-connected" | "chaotic";
  sceneChangeCount: number;
  dominantTone: "ironic" | "sincere" | "absurd" | "mixed";
}

// ─── Transcript analysis types ───

export interface TranscriptSegment {
  text: string;
  startTime: number;
  endTime: number;
}

export interface TranscriptAnalysis {
  fullText: string;
  segments: TranscriptSegment[];
  reasoningMarkers: string[];
  hasNarrativeArc: boolean;
}
