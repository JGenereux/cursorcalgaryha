import { BrainVisualization } from "../components/brain-dashboard/BrainVisualization";
import { UserFeed } from "../components/brain-dashboard/UserFeed";
import { mainDashboardUser } from "../data/mock-dashboard";

export default function Home(): React.JSX.Element {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(244,114,182,0.14)_0%,rgba(0,0,0,0)_42%),radial-gradient(circle_at_80%_20%,rgba(192,132,252,0.15)_0%,rgba(0,0,0,0)_45%),#09090B] px-4 py-7 text-white md:px-8">
      <BrainVisualization user={mainDashboardUser} />
      <UserFeed />
    </main>
  );
}
