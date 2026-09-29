export function TechTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md border border-border bg-surface-alt px-[9px] py-1 font-mono text-xs tracking-[0.02em] text-text-secondary">
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
