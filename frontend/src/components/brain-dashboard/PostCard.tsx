import { ConsumedPost } from "../../types/brain-dashboard";
import { getSeverityStyle } from "../../lib/brain-dashboard";

interface PostCardProps {
  consumed: ConsumedPost;
}

function PlatformBadge({ platform }: { platform: "tiktok" | "instagram" }) {
  if (platform === "tiktok") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase backdrop-blur">
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.2 8.2 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14Z" />
        </svg>
        TikTok
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-500/80 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-white uppercase backdrop-blur">
      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z" />
      </svg>
      Reels
    </span>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function PostCard({ consumed }: PostCardProps): React.JSX.Element {
  const style = getSeverityStyle(consumed.brainrotScore);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-black/40">
      {/* Thumbnail placeholder */}
      <div
        className={[
          "relative h-40 w-full bg-gradient-to-br",
          consumed.post.thumbnailGradient,
          "thumbnail-shimmer",
        ].join(" ")}
      >
        <div className="absolute left-3 top-3">
          <PlatformBadge platform={consumed.post.platform} />
        </div>
        <div
          className={[
            "absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border-2 border-black/30 text-sm font-black",
            style.glowClassName,
            consumed.brainrotScore >= 90
              ? "bg-red-500/90 text-white"
              : consumed.brainrotScore >= 60
                ? "bg-yellow-500/90 text-black"
                : "bg-emerald-500/90 text-black",
          ].join(" ")}
        >
          {consumed.brainrotScore}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold text-white/60">
          {consumed.post.creatorUsername}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-white/90">
          {consumed.post.caption}
        </p>

        {/* Brain impact tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {consumed.brainImpacts.map((impact) => {
            const impactStyle = getSeverityStyle(
              impact.delta > 14 ? 90 : impact.delta > 8 ? 60 : 30
            );
            return (
              <span
                key={impact.dimension}
                className={[
                  "rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold",
                  impactStyle.textClassName,
                ].join(" ")}
              >
                {impact.dimensionLabel} +{impact.delta}
              </span>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-3 text-[11px] text-white/45">
          <span>{formatCount(consumed.post.viewsCount)} views</span>
          <span>{formatCount(consumed.post.likesCount)} likes</span>
          <span>{consumed.consumedAt}</span>
        </div>
      </div>
    </article>
  );
}
