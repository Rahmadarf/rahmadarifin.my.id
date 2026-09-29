"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORIES, type SkillRow } from "@/lib/types/database";

// The design's tab filter, now real. "Main" is the is_core flag rather than a
// category, which is why the tab counts overlap and do not sum to All.
const CATEGORY_LABELS: Record<(typeof SKILL_CATEGORIES)[number], string> = {
  frontend: "Frontend",
  backend: "Backend",
  mobile: "Mobile",
  database: "Database",
  tools: "Tools",
};

type Filter = "all" | "main" | (typeof SKILL_CATEGORIES)[number];

export function SkillsSection({ skills }: { skills: SkillRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const tabs = useMemo(() => {
    const entries: { id: Filter; label: string; count: number }[] = [
      { id: "all", label: "All", count: skills.length },
      {
        id: "main",
        label: "Main",
        count: skills.filter((skill) => skill.is_core).length,
      },
    ];

    for (const category of SKILL_CATEGORIES) {
      const count = skills.filter(
        (skill) => skill.category === category,
      ).length;
      if (count > 0) {
        entries.push({
          id: category,
          label: CATEGORY_LABELS[category],
          count,
        });
      }
    }

    return entries.filter((tab) => tab.id === "all" || tab.count > 0);
  }, [skills]);

  const visible = useMemo(() => {
    if (filter === "all") return skills;
    if (filter === "main") return skills.filter((skill) => skill.is_core);
    return skills.filter((skill) => skill.category === filter);
  }, [filter, skills]);

  return (
    <section
      id="skills"
      className="mx-auto flex w-full max-w-[1080px] flex-col gap-8 px-6 pb-28 md:px-0 md:pb-36"
    >
      <div className="flex flex-col gap-2.5">
        <h2 className="text-3xl font-bold tracking-[-0.02em] md:text-[34px]">
          Skills
        </h2>
        <p className="text-[15px] text-text-tertiary">
          Filtered by category — only technologies I actually use.
        </p>
      </div>

      {skills.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-input bg-surface p-7 text-sm text-text-tertiary">
          Belum ada skill yang dipublikasikan.
        </p>
      ) : (
        <>
          <div role="tablist" aria-label="Filter skill" className="flex flex-wrap gap-2.5">
            {tabs.map((tab) => {
              const active = tab.id === filter;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-[18px] py-2.5 text-sm font-semibold transition-colors",
                    active
                      ? "border-primary/30 bg-accent text-primary"
                      : "border-border text-text-secondary hover:border-primary/30 hover:text-foreground",
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono text-xs opacity-60">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex min-h-16 flex-wrap gap-2.5 rounded-2xl border border-border bg-surface p-7">
            {visible.map((skill) => (
              <span
                key={skill.id}
                className="flex items-center gap-2 rounded-full border border-border bg-surface-alt px-4 py-2 font-mono text-xs tracking-[0.02em] text-foreground"
              >
                <span className="size-[7px] rounded-full bg-primary opacity-75" />
                {skill.name}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
