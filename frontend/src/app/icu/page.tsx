import Link from "next/link";
import { friendWardData } from "../../data/mock-dashboard";
import { FriendBrainCard } from "../../components/icu-ward/FriendBrainCard";
import { FriendsFeed } from "../../components/icu-ward/FriendsFeed";

export default function IcuWardPage(): React.JSX.Element {
  const sortedFriends = [...friendWardData].sort((a, b) => {
    return b.totalCookedScore - a.totalCookedScore;
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(244,114,182,0.13)_0%,rgba(0,0,0,0)_34%),#09090B] px-4 py-8 text-white md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
              Friends Monitoring
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
              ICU Ward
            </h1>
            <p className="text-sm text-white/65">
              Live mock data of your friends and how cooked their brains are.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-cyan-200/30 bg-cyan-500/15 px-4 py-2 text-xs font-semibold tracking-[0.12em] text-cyan-100 uppercase hover:bg-cyan-500/25"
          >
            Back to Brain
          </Link>
        </div>

        <section className="mb-6 rounded-2xl border border-white/15 bg-black/30 p-4">
          <p className="text-xs tracking-[0.14em] text-white/50 uppercase">
            Triage Rules
          </p>
          <p className="mt-2 text-sm text-white/70">
            Green means low cooked, red means high cooked, and 0 is not healthy.
            It means severe offline atrophy. Nobody is winning.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {sortedFriends.map((friend) => (
            <FriendBrainCard key={friend.id} friend={friend} />
          ))}
        </section>

        <FriendsFeed />
      </div>
    </main>
  );
}
