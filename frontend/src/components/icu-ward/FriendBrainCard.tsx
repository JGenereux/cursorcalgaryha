import Link from "next/link";
import {
  FriendWardRecord,
} from "../../types/brain-dashboard";
import {
  getBrainState,
  getRank,
  getSeverityStyle,
} from "../../lib/brain-dashboard";

interface FriendBrainCardProps {
  friend: FriendWardRecord;
}

interface RegionMiniBar {
  label: string;
  score: number;
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

function buildRegionMiniBars(friend: FriendWardRecord): RegionMiniBar[] {
  return friend.dimensions.map((dimension) => {
    return {
      label: dimension.regionLabel,
      score: dimension.score,
    };
  });
}

export function FriendBrainCard({
  friend,
}: FriendBrainCardProps): React.JSX.Element {
  const rank = getRank(friend.totalCookedScore);
  const state = getBrainState(friend.totalCookedScore);
  const miniBars = buildRegionMiniBars(friend);

  return (
    <article className="rounded-2xl border border-white/15 bg-black/35 p-4">
      <div className="flex items-center gap-3">
        <div
          className={[
            "grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br text-sm font-black text-white",
            getAvatarGradient(friend.avatarSeed),
          ].join(" ")}
        >
          {friend.avatarSeed}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{friend.name}</p>
          <p className="text-xs text-white/60">{friend.username}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs tracking-[0.14em] text-white/50 uppercase">Score</p>
          <p className="text-xl font-black text-white">{friend.totalCookedScore}</p>
        </div>
      </div>

      <p className="mt-3 text-xs tracking-[0.15em] text-fuchsia-200 uppercase">
        {rank.title}
      </p>
      <p className="text-xs text-white/55">{state.label}</p>

      <div className="mt-4 space-y-2">
        {miniBars.map((bar) => {
          const style = getSeverityStyle(bar.score);
          return (
            <div key={bar.label}>
              <div className="mb-1 flex justify-between text-[11px] text-white/65">
                <span>{bar.label}</span>
                <span className={style.textClassName}>{bar.score}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className={["h-2 rounded-full", style.fillClassName].join(" ")}
                  style={{ width: `${bar.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/45">
        <span>Posts consumed: {friend.postsConsumed}</span>
        <Link className="text-fuchsia-200 hover:text-fuchsia-100" href="/">
          Compare to your brain
        </Link>
      </div>
    </article>
  );
}
