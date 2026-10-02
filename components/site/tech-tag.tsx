// Stack chips and status chips from the design: a hairline border, 6px radius,
// Fira Code 12/16, no fill. Deliberately not a pill — the design reserves full
// rounding for the navbar, badges and toggles.
export function TechTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-sm border border-border px-2 py-1 font-mono text-xs leading-4 text-text-secondary">
      {children}
    </span>
  );
}

export function TechTagList({ tags }: { tags: string[] }) {
  if (!tags.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TechTag key={tag}>{tag}</TechTag>
      ))}
    </div>
  );
}
