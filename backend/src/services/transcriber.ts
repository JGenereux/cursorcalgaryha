import OpenAI from "openai";
import fs from "fs";
import { TranscriptAnalysis, TranscriptSegment } from "../types/brainrot";

// ─── Lazy OpenAI client (created on first use so dotenv has loaded) ───

let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// ─── Reasoning markers for cognitive depth ───

const REASONING_MARKERS = [
  "because",
  "therefore",
  "this means",
  "in other words",
  "for example",
  "however",
  "although",
  "consequently",
  "as a result",
  "on the other hand",
  "first",
  "second",
  "third",
  "finally",
  "in conclusion",
  "the reason",
  "which explains",
  "let me explain",
  "think about it",
  "consider this",
];

// ─── Transcribe audio using Whisper API ───

export async function transcribeAudio(
  audioPath: string
): Promise<TranscriptAnalysis> {
  try {
    const audioFile = fs.createReadStream(audioPath);

    const transcription = await getOpenAI().audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      response_format: "verbose_json",
      timestamp_granularities: ["segment"],
    });

    const fullText = transcription.text ?? "";

    // Map segments from Whisper response
    const segments: TranscriptSegment[] = (
      (transcription as unknown as WhisperVerboseResponse).segments ?? []
    ).map((seg) => ({
      text: seg.text ?? "",
      startTime: seg.start ?? 0,
      endTime: seg.end ?? 0,
    }));

    // Find reasoning markers in the text
    const lowerText = fullText.toLowerCase();
    const foundMarkers = REASONING_MARKERS.filter((marker) =>
      lowerText.includes(marker)
    );

    // Detect narrative arc (has beginning/middle/end structure)
    const hasNarrativeArc = detectNarrativeArc(fullText, segments);

    return {
      fullText,
      segments,
      reasoningMarkers: foundMarkers,
      hasNarrativeArc,
    };
  } catch (err) {
    console.error("[transcriber] Error:", err);
    return {
      fullText: "",
      segments: [],
      reasoningMarkers: [],
      hasNarrativeArc: false,
    };
  }
}

// ─── Whisper verbose response shape ───

interface WhisperSegment {
  text?: string;
  start?: number;
  end?: number;
}

interface WhisperVerboseResponse {
  text?: string;
  segments?: WhisperSegment[];
}

// ─── Simple narrative arc detection ───

function detectNarrativeArc(
  _fullText: string,
  segments: TranscriptSegment[]
): boolean {
  if (segments.length < 3) return false;

  // Check if content has transitional structure
  const fullLower = segments.map((s) => s.text.toLowerCase()).join(" ");
  const transitionWords = [
    "but then",
    "and then",
    "next",
    "after that",
    "so then",
    "finally",
    "in the end",
    "it turns out",
    "the twist",
    "plot twist",
  ];

  const transitionCount = transitionWords.filter((w) =>
    fullLower.includes(w)
  ).length;

  return transitionCount >= 2;
}
