/** Mirrors the backend's code-token pattern purely for splitting text into
 * codes for display grouping — the actual definitions always come from the
 * backend's lookup endpoint, never duplicated here. */
const CODE_PATTERN = /\b[PBCU][0-9A-F]{4}\b/gi;

export function parseObdCodeTokens(rawText: string): string[] {
  const matches = rawText.toUpperCase().match(CODE_PATTERN) ?? [];
  return Array.from(new Set(matches));
}
