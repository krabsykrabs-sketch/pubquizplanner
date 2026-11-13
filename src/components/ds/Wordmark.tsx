/** Brand mark: a ticked answer box, tilted like a sticker. Ink square with a
 * yellow tick on paper; the colours invert inside [data-theme="dark"]
 * (see --mark-bg / --mark-fg in globals.css). With `festive` it wears a
 * Santa hat (seasonal, see src/lib/festive.ts). */
export function BrandMark({
  size = 30,
  festive = false,
  className = '',
}: {
  size?: number;
  festive?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`relative inline-grid flex-none -rotate-6 place-items-center rounded-[28%] bg-[var(--mark-bg)] text-[var(--mark-fg)] ${className}`}
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
      {festive && (
        <svg
          viewBox="0 0 50 42"
          width={size * 0.92}
          height={size * 0.78}
          className="absolute"
          style={{ left: -size * 0.2, top: -size * 0.5, transform: 'rotate(-14deg)' }}
        >
          <g stroke="#1A2238" strokeWidth="2.6" strokeLinejoin="round">
            <path
              d="M9 30C9 14 22 3 34 5c7 1 11 7 10 14l-4-1c-2-5-7-4-3 12z"
              fill="var(--berry)"
            />
            <rect x="3.5" y="27" width="39" height="10.5" rx="5.25" fill="#fff" />
            <circle cx="43.5" cy="20.5" r="5" fill="#fff" />
          </g>
        </svg>
      )}
    </span>
  );
}

/** Wordmark: tick box + "PubQuizPlanner" in the display face, "Planner" in the accent. */
export default function Wordmark({
  size = 30,
  festive = false,
  textClassName = 'text-[1.28rem]',
}: {
  size?: number;
  festive?: boolean;
  textClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <BrandMark size={size} festive={festive} />
      <span
        className={`font-display font-extrabold tracking-[-0.02em] text-[var(--text-strong)] ${textClassName}`}
      >
        PubQuiz<span className="text-[var(--accent-text)]">Planner</span>
      </span>
    </span>
  );
}
