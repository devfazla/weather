import type { Weather } from "../data/weather";

type Props = {
  spotlight: Weather["spotlight"];
};

export default function HighlightsCard({ spotlight }: Props) {
  const { headline, meta, action } = spotlight;

  return (
    <section className="flex min-h-[228px] flex-col justify-between rounded-lg bg-ink-soft px-7 py-7 text-white">
      <p className="text-[24px] font-bold leading-[1.3] tracking-[-0.01em]">
        {headline.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>

      <div className="mt-8 flex items-end justify-between gap-4">
        <p className="text-[12px] text-white/55">{meta}</p>
        <button
          type="button"
          className="shrink-0 rounded-full bg-white px-5 py-[11px] text-[14px] font-semibold text-[#142430] shadow-[0_8px_20px_-10px_rgba(0,0,0,0.6)] transition-transform duration-200 hover:scale-[1.03] active:scale-[0.99]"
        >
          {action}
        </button>
      </div>
    </section>
  );
}
