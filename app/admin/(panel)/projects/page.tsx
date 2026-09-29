import Link from "next/link";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { listOwnProjects } from "@/lib/data/admin";
import { deleteProject } from "@/lib/actions/portfolio";
import { EmptyState, PanelHeader } from "@/components/admin/panel-header";
import { ProjectForm } from "@/components/admin/project-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { ProjectStatusToggle } from "@/components/admin/status-toggle";
import { DeleteRow } from "@/components/admin/delete-row";

export const metadata = { title: "Projects — Admin" };

export default async function AdminProjectsPage(
  props: PageProps<"/admin/projects">,
) {
  const { user } = await requireAdmin();
  const [{ edit }, projects] = await Promise.all([
    props.searchParams,
    listOwnProjects(),
  ]);

  // Editing is driven by the URL rather than client state, so the form is
  // rendered on the server with the row's real values.
  const editId = Number(Array.isArray(edit) ? edit[0] : edit);
  const editing =
    projects.find((project) => project.id === editId) ?? null;

  return (
    <>
      <PanelHeader
        title="Projects"
        subtitle="Add, edit, or remove the projects shown on your portfolio."
      />

      {projects.length ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`flex flex-wrap items-center gap-4 p-4 ${
                index < projects.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-[linear-gradient(135deg,oklch(0.55_0.19_257/0.16),var(--surface-alt))]">
                {project.thumbnailUrl ? (
                  <Image
                    src={project.thumbnailUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-bold">{project.title}</h3>
                <p className="mt-0.5 truncate text-[13px] text-text-tertiary">
                  {project.tech_tags.join(" · ") || "Belum ada tech tag"}
                </p>
              </div>

              <StatusBadge status={project.status} />
              <ProjectStatusToggle id={project.id} status={project.status} />

              <Link
                href={`/admin/projects?edit=${project.id}`}
                aria-label={`Edit ${project.title}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Pencil className="size-3.5" />
              </Link>

              <DeleteRow
                id={project.id}
                action={deleteProject}
                entityLabel="proyek"
                name={project.title}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState>
          Belum ada proyek. Tambahkan yang pertama lewat form di bawah.
        </EmptyState>
      )}

      <ProjectForm ownerId={user.id} project={editing} />
    </>
  );
}
