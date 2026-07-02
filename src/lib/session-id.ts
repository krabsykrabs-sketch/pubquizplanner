// Anonymous per-visit ID in sessionStorage: links events within one tab
// session for the analytics funnel, dies when the tab closes, and never
// identifies a user across visits.
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let id = sessionStorage.getItem('pqp_sid');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('pqp_sid', id);
    }
    return id;
  } catch {
    return null;
  }
}
