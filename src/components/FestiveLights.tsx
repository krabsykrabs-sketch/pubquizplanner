import { fairyLights } from '@/lib/festive';

/** A string of fairy lights along the top edge of its (positioned) parent, or
 * hanging below it with `hang`. Purely decorative; the two bulb layers
 * twinkle out of phase unless the visitor prefers reduced motion. */
export default function FestiveLights({
  onDark = false,
  hang = false,
  className = '',
}: {
  onDark?: boolean;
  /** Hang from the parent's bottom edge instead of sitting inside its top. */
  hang?: boolean;
  className?: string;
}) {
  const l = fairyLights(onDark);
  return (
    <div
      aria-hidden
      className={`festive-lights ${hang ? 'top-full' : 'top-0'} ${className}`}
    >
      <span style={{ backgroundImage: l.wire }} />
      <span className="festive-twinkle-a" style={{ backgroundImage: l.bulbsA }} />
      <span className="festive-twinkle-b" style={{ backgroundImage: l.bulbsB }} />
    </div>
  );
}
