/**
 * Retired. Persistent session policy: no idle logout, no keep-alive pings,
 * no visibilitychange refresh. See docs/BHD-SESSION-POLICY.md.
 * Kept as a no-op so accidental imports cannot revive the old behaviour.
 */
export function SessionKeepAlive() {
  return null;
}
