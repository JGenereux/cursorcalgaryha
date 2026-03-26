"use client";

import Link from "next/link";
import {
  getBrainState,
  getDimensionByRegion,
  getSeverityStyle,
  getRank,
} from "@/lib/brain-dashboard";
import { BrainDimension, DashboardUser } from "@/types/brain-dashboard";
import { Brain3D } from "./Brain3D";

// ─── Props ───

interface BrainVisualizationProps {
  user: DashboardUser;
}

interface StatCardProps {
  dimension: BrainDimension;
}

// ─── Compact stat card (no pointer lines) ───

function StatCard({ dimension }: StatCardProps): React.JSX.Element {
  const style = getSeverityStyle(dimension.score);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm">
      <p className="text-[9px] font-semibold tracking-[0.18em] text-white/50 uppercase">
        {dimension.regionLabel}
      </p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-white">
          {dimension.dimensionLabel}
        </p>
        <p className={["text-sm font-bold tabular-nums", style.textClassName].join(" ")}>
          {dimension.score}
        </p>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-white/40">
        {dimension.jokeLine}
      </p>
    </div>
  );
}

// ─── Main dashboard section ───

export function BrainVisualization({
  user,
}: BrainVisualizationProps): React.JSX.Element {
  const brainState = getBrainState(user.totalCookedScore);
  const rank = getRank(user.totalCookedScore);
  const isDeepFried = user.totalCookedScore >= 95;

  const frontal = getDimensionByRegion(user.dimensions, "frontalLobe");
  const temporal = getDimensionByRegion(user.dimensions, "temporalLobe");
  const occipital = getDimensionByRegion(user.dimensions, "occipitalLobe");
  const parietal = getDimensionByRegion(user.dimensions, "parietalLobe");

  if (!frontal || !temporal || !occipital || !parietal) {
    return (
      <section className="rounded-2xl border border-white/15 bg-black/20 p-8">
        <p className="text-white/80">Missing brain region data.</p>
      </section>
    );
  }

  return (
    <section
      className={[
        "relative mx-auto w-full max-w-6xl overflow-hidden rounded-3xl p-5 md:px-8 md:pt-6 md:pb-5",
        isDeepFried ? "deep-fry-bg" : "",
      ].join(" ")}
    >
      {/* ── Header: user info + nav ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] text-white/40 uppercase">
            Brainrot Index — User Dashboard
          </p>
          <h1 className="mt-1 text-xl font-black tracking-tight md:text-2xl">
            #{user.leaderboardRank} — {user.name}
          </h1>
          <p className="mt-0.5 text-xs text-fuchsia-200/80">
            &ldquo;{user.tagLine}&rdquo; · cooked score{" "}
            <span className="font-bold text-white">{user.totalCookedScore}</span>
          </p>
        </div>
        <Link
          href="/icu"
          className="shrink-0 rounded-full border border-fuchsia-200/30 bg-fuchsia-500/15 px-4 py-1.5 text-[10px] font-semibold tracking-[0.14em] text-fuchsia-100 uppercase transition-colors hover:bg-fuchsia-500/25"
        >
          Friends →
        </Link>
      </div>

      {/* ── Description ── */}
      <p className="mx-auto mt-2 max-w-lg text-center text-[10px] leading-relaxed text-white/35">
        Your brain on social media. Each region maps to a brainrot dimension.
        Color and intensity reflect how far gone you are. Spin it. Stare at it.
        It&apos;s too late anyway.
      </p>

      {/* ── Brain + flanking stat cards ── */}
      <div className="mt-1 grid grid-cols-[minmax(160px,1fr)_minmax(280px,2.2fr)_minmax(160px,1fr)] items-center gap-3">
        {/* Left stats */}
        <div className="flex flex-col gap-2.5">
          <StatCard dimension={frontal} />
          <StatCard dimension={temporal} />
        </div>

        {/* 3D Brain (center) */}
        <div className="relative">
          <Brain3D
            totalCookedScore={user.totalCookedScore}
            dimensions={user.dimensions}
          />
        </div>

        {/* Right stats */}
        <div className="flex flex-col gap-2.5">
          <StatCard dimension={occipital} />
          <StatCard dimension={parietal} />
        </div>
      </div>

      {/* ── State label beneath ── */}
      <p className="-mt-2 text-center text-[10px] tracking-[0.16em] text-white/40 uppercase">
        {brainState.label} — {brainState.vibe}
      </p>
    </section>
  );
}
