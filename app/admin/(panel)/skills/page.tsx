import Link from "next/link";
import { Pencil } from "lucide-react";
import { listOwnSkills } from "@/lib/data/admin";
import { deleteSkill } from "@/lib/actions/portfolio";
import { EmptyState, PanelHeader } from "@/components/admin/panel-header";
import { SkillForm } from "@/components/admin/skill-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteRow } from "@/components/admin/delete-row";

export const metadata = { title: "Tech Stack — Admin" };

export default async function AdminSkillsPage(
  props: PageProps<"/admin/skills">,
) {
  const [{ edit }, skills] = await Promise.all([
    props.searchParams,
    listOwnSkills(),
  ]);

  const editId = Number(Array.isArray(edit) ? edit[0] : edit);
  const editing = skills.find((skill) => skill.id === editId) ?? null;

  return (
    <>
      <PanelHeader
        title="Tech Stack"
        subtitle="Manage the skills shown in the Skills section, grouped by category."
      />

      {skills.length ? (
        <div className="flex flex-wrap gap-2.5 rounded-2xl border border-border bg-background p-7">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 rounded-full border border-border bg-surface-alt py-1.5 pl-4 pr-1.5"
            >
              <span className="font-mono text-xs tracking-[0.02em]">
                {skill.name}
              </span>
              <span className="font-mono text-[11px] text-text-tertiary">
                {skill.category}
                {skill.is_core ? " · main" : ""}
              </span>
              <StatusBadge status={skill.status} />

              <Link
                href={`/admin/skills?edit=${skill.id}`}
                aria-label={`Edit ${skill.name}`}
                className="flex size-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-primary"
              >
                <Pencil className="size-3" />
              </Link>

              <DeleteRow
                id={skill.id}
                action={deleteSkill}
                entityLabel="skill"
                name={skill.name}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>Belum ada skill.</EmptyState>
      )}

      <SkillForm skill={editing} />
    </>
  );
}
