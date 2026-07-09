/** Brand wordmark: amber "?" roundel + "PubQuizPlanner" set in Archivo.
 * No logo file exists yet — the brand is set in type per the design system. */
export function QuestionRoundel({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={`flex-none ${className}`}
      aria-hidden
    >
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle
        cx="24"
        cy="24"
        r="16.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeDasharray="0.5 3.4"
        strokeLinecap="round"
      />
      <text
        x="24"
        y="33"
        fontFamily="var(--font-display), Archivo, sans-serif"
        fontWeight="800"
        fontSize="24"
        textAnchor="middle"
        fill="currentColor"
      >
        ?
      </text>
    </svg>
  );
}

export default function Wordmark({
  size = 30,
  textClassName = 'text-[1.28rem]',
  roundelClassName = 'text-[var(--accent)]',
}: {
  size?: number;
  textClassName?: string;
  roundelClassName?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <QuestionRoundel size={size} className={roundelClassName} />
      <span
        className={`font-display font-extrabold tracking-[-0.03em] text-[var(--text-strong)] ${textClassName}`}
      >
        PubQuizPlanner
      </span>
    </span>
  );
}
