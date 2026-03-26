import {
  brainStateScale,
  brainrotRanks,
} from "../data/mock-dashboard";
import {
  BrainDimension,
  BrainStateDefinition,
  RankDefinition,
  SeverityStyle,
} from "../types/brain-dashboard";

export function getBrainState(totalScore: number): BrainStateDefinition {
  const score = clampScore(totalScore);
  const match = brainStateScale.find((state) => {
    return score >= state.minScore && score <= state.maxScore;
  });
  return match ?? brainStateScale[brainStateScale.length - 1];
}

export function getRank(totalScore: number): RankDefinition {
  const score = clampScore(totalScore);
  const match = brainrotRanks.find((rank) => {
    return score >= rank.minScore && score <= rank.maxScore;
  });
  return match ?? brainrotRanks[brainrotRanks.length - 1];
}

export function getSeverityStyle(score: number): SeverityStyle {
  if (score <= 33) {
    return {
      textClassName: "text-emerald-300",
      glowClassName: "shadow-[0_0_22px_rgba(52,211,153,0.45)]",
      fillClassName: "fill-emerald-500/75",
    };
  }
  if (score <= 66) {
    return {
      textClassName: "text-yellow-300",
      glowClassName: "shadow-[0_0_22px_rgba(253,224,71,0.45)]",
      fillClassName: "fill-yellow-500/80",
    };
  }
  return {
    textClassName: "text-red-300",
    glowClassName: "shadow-[0_0_24px_rgba(248,113,113,0.55)]",
    fillClassName: "fill-red-500/85",
  };
}

export function getDimensionByRegion(
  dimensions: BrainDimension[],
  region: BrainDimension["region"]
): BrainDimension | null {
  const match = dimensions.find((dimension) => dimension.region === region);
  return match ?? null;
}

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Numeric RGB for Three.js materials ───

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function getSeverityColor(score: number): RgbColor {
  if (score <= 33) {
    // emerald-400
    return { r: 52, g: 211, b: 153 };
  }
  if (score <= 66) {
    // yellow-400
    return { r: 250, g: 204, b: 21 };
  }
  // red-400
  return { r: 248, g: 113, b: 113 };
}
