/** Brand mark: a ticked answer box, tilted like a sticker. Ink square with a
 * yellow tick on paper; the colours invert inside [data-theme="dark"]
 * (see --mark-bg / --mark-fg in globals.css). */
export function BrandMark({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-grid flex-none -rotate-6 place-items-center rounded-[28%] bg-[var(--mark-bg)] text-[var(--mark-fg)] ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

/** Wordmark: tick box + "PubQuizPlanner" in the display face, "Planner" in the accent. */
export default function Wordmark({
  size = 30,
  textClassName = 'text-[1.28rem]',
}: {
  size?: number;
  textClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <BrandMark size={size} />
      <span
        className={`font-display font-extrabold tracking-[-0.02em] text-[var(--text-strong)] ${textClassName}`}
      >
        PubQuiz<span className="text-[var(--accent-text)]">Planner</span>
      </span>
    </span>
  );
}
