// Generator funnel instrumentation (added 2026-11-14). Opening /generator
// auto-loads a full preview, which is what 'quiz_generated' counts — so that
// event alone can't tell "looked around" from "built and used a quiz". These
// actions split the journey into steps. Shared by the client tracker, the API
// allow-list and the admin dashboard.
export const GENERATOR_ACTIONS = [
  'customize', // changed the quiz: meta.kind
  'round_view', // opened another round in the preview: meta.round
  'to_download', // reached step 2
  'download_click', // clicked a download button: meta.format
  'download_error', // that download failed: meta.format, meta.status
  'copy', // copied text from the generator: meta.step
  'exit', // left / hid the page: meta.step, meta.seconds
] as const;
export type GeneratorAction = (typeof GENERATOR_ACTIONS)[number];

export const CUSTOMIZE_KINDS = ['category', 'count', 'add_round', 'remove_round', 'reroll', 'swap'] as const;
export type CustomizeKind = (typeof CUSTOMIZE_KINDS)[number];

export const DOWNLOAD_FORMATS = ['slides', 'answer_sheet', 'cheat_sheet'] as const;
export type DownloadFormat = (typeof DOWNLOAD_FORMATS)[number];

/** Only generator sessions from this day on carry the actions above. */
export const GENERATOR_TRACKING_SINCE = '2026-11-14';

/** questions.shown_count / swap_count start counting from this day.
 *  Reset on 2026-11-26 (old counts kept in table questions_swap_backup_20261126): the first days were dominated by single visits that
 *  swapped 80+ times, now capped by SWAPS_COUNTED_PER_VISIT. */
export const SWAP_TRACKING_SINCE = '2026-11-26';

/** Only a visit's first N swaps feed the quality stats — someone flipping
 *  through dozens of questions (e.g. playing straight off the phone) would
 *  otherwise drown out everyone else. */
export const SWAPS_COUNTED_PER_VISIT = 10;

/** Hard cap per visit so a stuck client can't flood the events table. */
export const MAX_GENERATOR_EVENTS_PER_SESSION = 80;

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === 'string' && (list as readonly string[]).includes(v);

const intIn = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === 'number' ? Math.round(v) : NaN;
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

/** Validate an incoming action + meta; returns the cleaned meta or null. */
export function cleanGeneratorEvent(
  action: unknown,
  meta: Record<string, unknown> | null | undefined
): { action: GeneratorAction; meta: Record<string, string | number> } | null {
  if (!isOneOf(GENERATOR_ACTIONS, action)) return null;
  const m = meta ?? {};
  const out: Record<string, string | number> = { action };
  switch (action) {
    case 'customize':
      if (!isOneOf(CUSTOMIZE_KINDS, m.kind)) return null;
      out.kind = m.kind;
      break;
    case 'round_view': {
      const r = intIn(m.round, 1, 20);
      if (r === null) return null;
      out.round = r;
      break;
    }
    case 'download_click':
    case 'download_error':
      if (!isOneOf(DOWNLOAD_FORMATS, m.format)) return null;
      out.format = m.format;
      if (action === 'download_error') out.status = intIn(m.status, 0, 599) ?? 0;
      break;
    case 'copy':
    case 'exit': {
      const step = intIn(m.step, 1, 2);
      if (step === null) return null;
      out.step = step;
      if (action === 'exit') {
        const s = intIn(m.seconds, 0, 6 * 3600);
        if (s === null) return null;
        out.seconds = s;
      }
      break;
    }
    case 'to_download':
      break;
  }
  return { action, meta: out };
}
