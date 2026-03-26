import {
  BrainDimension,
} from "../../types/brain-dashboard";
import {
  getSeverityStyle,
} from "../../lib/brain-dashboard";

interface DimensionGridProps {
  dimensions: BrainDimension[];
}

export function DimensionGrid({
  dimensions,
}: DimensionGridProps): React.JSX.Element {
  return (
    <section className="mx-auto mt-7 grid w-full max-w-6xl gap-4 sm:grid-cols-2">
      {dimensions.map((dimension) => {
        const style = getSeverityStyle(dimension.score);
        return (
          <article
            key={dimension.id}
            className={[
              "rounded-2xl border border-white/15 bg-black/30 p-4",
              style.glowClassName,
            ].join(" ")}
          >
            <p className="text-xs tracking-[0.16em] text-white/65 uppercase">
              {dimension.regionLabel}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-lg font-semibold text-white">
                {dimension.dimensionLabel}
              </p>
              <p className={["text-lg font-bold", style.textClassName].join(" ")}>
                {dimension.score}/100
              </p>
            </div>
            <p className="mt-2 text-sm text-white/70">{dimension.jokeLine}</p>
            <p className="mt-1 text-xs text-white/45">
              Last used: {dimension.lastUsed}
            </p>
          </article>
        );
      })}
    </section>
  );
}
