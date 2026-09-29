import Link from "next/link";
import { Pencil } from "lucide-react";
import { listOwnTimeline } from "@/lib/data/admin";
import { deleteTimelineEntry } from "@/lib/actions/portfolio";
import { EmptyState, PanelHeader } from "@/components/admin/panel-header";
import { TimelineForm } from "@/components/admin/timeline-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteRow } from "@/components/admin/delete-row";

export const metadata = { title: "Timeline — Admin" };

export default async function AdminTimelinePage(
  props: PageProps<"/admin/timeline">,
) {
  const [{ edit }, entries] = await Promise.all([
    props.searchParams,
    listOwnTimeline(),
  ]);

  const editId = Number(Array.isArray(edit) ? edit[0] : edit);
  const editing = entries.find((entry) => entry.id === editId) ?? null;

  return (
    <>
      <PanelHeader
        title="Timeline"
        subtitle="Manage the Activities & Seminars entries on your homepage."
      />

      {entries.length ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex flex-wrap items-center gap-4 p-4 ${
                index < entries.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <span className="font-mono text-xs tracking-[0.02em] text-text-tertiary">
                  {entry.period_label}
                </span>
                <h3 className="mt-1 text-[15px] font-bold">{entry.title}</h3>
                {entry.role ? (
                  <p className="mt-0.5 truncate text-[13px] text-text-tertiary">
                    {entry.role}
                  </p>
                ) : null}
              </div>

              <StatusBadge status={entry.status} />

              <Link
                href={`/admin/timeline?edit=${entry.id}`}
                aria-label={`Edit ${entry.title}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Pencil className="size-3.5" />
              </Link>

              <DeleteRow
                id={entry.id}
                action={deleteTimelineEntry}
                entityLabel="entri timeline"
                name={entry.title}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>Belum ada entri timeline.</EmptyState>
      )}

      <TimelineForm entry={editing} />
    </>
  );
}
