// `certifications` and `education` are free-text columns — one textarea each in
// the admin, with no structure behind them. The About section renders them as
// lists, so they are parsed here rather than reshaped in the database.

/** One item per non-empty line. */
export function splitLines(value: string | null): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export type EducationEntry = { title: string; meta: string | null };

/**
 * Splits "Institution name — Program · 2020–2024" into its title and meta line.
 *
 * Only an em dash (—) separates the two, and only the first one counts: an en
 * dash (–) is what year ranges use, and splitting on that would cut the meta
 * line in half. A line without an em dash is all title.
 */
export function parseEducationEntry(line: string): EducationEntry {
  const separator = line.indexOf("—");
  if (separator === -1) return { title: line, meta: null };

  return {
    title: line.slice(0, separator).trim(),
    meta: line.slice(separator + 1).trim() || null,
  };
}

// Stand-in copy that reached the database from the seed, or that an editor
// pasted out of the design. None of it should ever be served.
const PLACEHOLDER_PATTERNS = [
  /20xx/i,
  /^\s*\[.*\]\s*$/,
  /^(institution name|certification or course|program|issuer)$/i,
];

/** True when an education line is filler rather than real content. */
export function isPlaceholderEducation(entry: EducationEntry): boolean {
  const whole = [entry.title, entry.meta].filter(Boolean).join(" — ");
  return PLACEHOLDER_PATTERNS.some(
    (pattern) => pattern.test(whole) || pattern.test(entry.title),
  );
}

/** Real education entries only; an all-placeholder list comes back empty. */
export function publishedEducation(value: string | null): EducationEntry[] {
  return splitLines(value)
    .map(parseEducationEntry)
    .filter((entry) => !isPlaceholderEducation(entry));
}
