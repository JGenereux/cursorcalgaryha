import { friendFeedData } from "../../data/mock-dashboard";
import { FriendFeedItem } from "./FriendFeedItem";

export function FriendsFeed(): React.JSX.Element {
  const topEntries = friendFeedData.slice(0, 2);

  return (
    <section className="mt-8">
      <div className="mb-4">
        <p className="text-xs tracking-[0.2em] text-white/50 uppercase">
          Live Feed
        </p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-white">
          What Friends Are Watching
        </h2>
      </div>

      <div className="space-y-3">
        {topEntries.map((entry, idx) => (
          <FriendFeedItem key={`${entry.friendId}-${entry.consumed.post.id}-${idx}`} entry={entry} />
        ))}
      </div>
    </section>
  );
}
