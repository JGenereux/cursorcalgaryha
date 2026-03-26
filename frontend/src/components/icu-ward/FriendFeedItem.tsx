import { FriendFeedEntry } from "../../types/brain-dashboard";
import { getSeverityStyle } from "../../lib/brain-dashboard";

interface FriendFeedItemProps {
  entry: FriendFeedEntry;
}

function getAvatarGradient(seed: string): string {
  const variants: Record<string, string> = {
    RT: "from-pink-500 to-fuchsia-600",
    MC: "from-cyan-500 to-blue-600",
    DP: "from-yellow-400 to-orange-600",
    SN: "from-emerald-500 to-teal-600",
    AR: "from-zinc-500 to-zinc-700",
  };
  return variants[seed] ?? "from-violet-500 to-purple-700";
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function FriendFeedItem({
  entry,
}: FriendFeedItemProps): React.JSX.Element {
  const style = getSeverityStyle(entry.consumed.brainrotScore);
  const post = entry.consumed.post;

  return (
    <article className="flex gap-4 rounded-2xl border border-white/10 bg-black/30 p-4">
      {/* Friend avatar column */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div
          className={[
            "grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br text-xs font-black text-white",
            getAvatarGradient(entry.friendAvatarSeed),
          ].join(" ")}
        >
          {entry.friendAvatarSeed}
        </div>
        <div className="h-full w-px bg-white/10" />
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Friend header */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">{entry.friendName}</p>
          <p className="text-xs text-white/45">{entry.friendUsername}</p>
          <span className="ml-auto text-[11px] text-white/35">
            {entry.consumed.consumedAt}
          </span>
        </div>

        {/* Post preview */}
        <div className="mt-2 flex gap-3 rounded-xl border border-white/8 bg-white/5 p-3">
          {/* Mini thumbnail */}
          <div
            className={[
              "h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br",
              post.thumbnailGradient,
              "thumbnail-shimmer",
            ].join(" ")}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase",
                  post.platform === "tiktok"
                    ? "bg-black/50 text-white"
                    : "bg-gradient-to-r from-purple-600/60 to-pink-500/60 text-white",
                ].join(" ")}
              >
                {post.platform === "tiktok" ? "TikTok" : "Reels"}
              </span>
              <span className="text-[11px] text-white/50">
                {post.creatorUsername}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-white/75">
              {post.caption}
            </p>
            <div className="mt-1 flex items-center gap-3 text-[10px] text-white/40">
              <span>{formatCount(post.viewsCount)} views</span>
              <span>{formatCount(post.likesCount)} likes</span>
            </div>
          </div>

          {/* Score badge */}
          <div
            className={[
              "grid h-10 w-10 shrink-0 place-items-center self-center rounded-full text-xs font-black",
              style.glowClassName,
              entry.consumed.brainrotScore >= 90
                ? "bg-red-500/80 text-white"
                : entry.consumed.brainrotScore >= 60
                  ? "bg-yellow-500/80 text-black"
                  : "bg-emerald-500/80 text-black",
            ].join(" ")}
          >
            {entry.consumed.brainrotScore}
          </div>
        </div>

        {/* Brain impact tags */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entry.consumed.brainImpacts.slice(0, 3).map((impact) => {
            const impactStyle = getSeverityStyle(
              impact.delta > 14 ? 90 : impact.delta > 8 ? 60 : 30
            );
            return (
              <span
                key={impact.dimension}
                className={[
                  "rounded-full border border-white/8 bg-white/5 px-2 py-0.5 text-[10px] font-semibold",
                  impactStyle.textClassName,
                ].join(" ")}
              >
                {impact.dimensionLabel} +{impact.delta}
              </span>
            );
          })}
        </div>

        {/* Roast line */}
        <p className="mt-2 text-xs text-fuchsia-200/70 italic">
          {entry.roastLine}
        </p>
      </div>
    </article>
  );
}
