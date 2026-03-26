interface EkgLineProps {
  cookedScore: number;
}

function getFlatlineClassName(cookedScore: number): string {
  if (cookedScore >= 96) {
    return "opacity-95";
  }
  if (cookedScore >= 81) {
    return "opacity-65";
  }
  return "opacity-20";
}

export function EkgLine({ cookedScore }: EkgLineProps): React.JSX.Element {
  const flatlineClassName = getFlatlineClassName(cookedScore);

  return (
    <section className="mx-auto mt-8 w-full max-w-5xl rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="mb-2 text-xs tracking-[0.16em] text-white/60 uppercase">
        Neural Pulse Monitor
      </p>
      <div className="relative h-16 overflow-hidden rounded-lg border border-emerald-400/30 bg-black/60">
        <div className="ekg-line absolute inset-0" />
        <div
          className={[
            "absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-red-500/40 to-transparent transition-opacity duration-500",
            flatlineClassName,
          ].join(" ")}
        />
      </div>
      <p className="mt-2 text-xs text-white/45">
        At high cooked levels this trends toward flatline. No sweet spot. Everyone
        loses.
      </p>
    </section>
  );
}
