import { userConsumedPosts } from "../../data/mock-dashboard";
import { PostCard } from "./PostCard";

export function UserFeed(): React.JSX.Element {
  const topPosts = userConsumedPosts.slice(0, 2);

  return (
    <section className="mx-auto mt-8 w-full max-w-6xl">
      <div className="mb-4">
        <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
          Recently Consumed
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">
          What&apos;s Cooking Your Brain
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {topPosts.map((consumed) => (
          <PostCard key={consumed.post.id} consumed={consumed} />
        ))}
      </div>
    </section>
  );
}
