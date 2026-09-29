export function PanelHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-extrabold tracking-[-0.02em] md:text-[26px]">
        {title}
      </h1>
      <p className="text-sm text-text-tertiary">{subtitle}</p>
    </header>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-input bg-background p-7 text-sm text-text-tertiary">
      {children}
    </p>
  );
}
