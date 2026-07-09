'use client';

/** Toggle switch. Color is never the only signal — pair with a label. */
export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 flex-none items-center rounded-full border-[1.5px] transition-colors duration-200',
        checked
          ? 'border-transparent bg-[var(--accent)]'
          : 'border-[var(--border-strong)] bg-[var(--surface-inset)]',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        'focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]',
        className,
      ].join(' ')}
    >
      <span
        aria-hidden
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-warm-sm transition-transform duration-200 [transition-timing-function:var(--ease-out)] ${
          checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
        }`}
      />
    </button>
  );
}
