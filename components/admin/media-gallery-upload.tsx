"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_MIME_TYPES,
  buildMediaPath,
  describeMediaLimits,
  type MediaKind,
} from "@/lib/media/paths";

type Entry = { path: string; url: string | null };

/**
 * The ordered gallery behind the detail page's "Screens" section.
 *
 * Same contract as MediaUpload — the browser uploads straight to Storage and
 * the form submits paths only — but it holds a list instead of one value, and
 * order is the display order. The hidden input carries one path per line,
 * which is what the schema parses.
 *
 * Deleting an upload this component made and that the row does not reference
 * yet happens here, immediately. Anything that still slips through is the
 * server-side sweep's problem.
 */
export function MediaGalleryUpload({
  name,
  ownerId,
  kind,
  initialPaths,
  initialUrls,
  label,
}: {
  name: string;
  ownerId: string;
  kind: MediaKind;
  initialPaths: string[];
  initialUrls: string[];
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<Entry[]>(() =>
    initialPaths.map((path, index) => ({
      path,
      url: initialUrls[index] ?? null,
    })),
  );
  const [busy, setBusy] = useState(false);
  const [uploadedHere, setUploadedHere] = useState<string[]>([]);

  const stored = initialPaths.join("\n");
  const current = entries.map((entry) => entry.path).join("\n");
  const unsaved = current !== stored;

  useEffect(() => {
    if (!unsaved) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  async function discardIfUnsaved(candidate: string) {
    if (initialPaths.includes(candidate)) return;
    if (!uploadedHere.includes(candidate)) return;

    setUploadedHere((paths) => paths.filter((p) => p !== candidate));
    const supabase = createClient();
    await supabase.storage.from(MEDIA_BUCKET).remove([candidate]);
  }

  async function handleFiles(files: File[]) {
    setBusy(true);
    try {
      const supabase = createClient();

      for (const file of files) {
        if (!(MEDIA_MIME_TYPES as readonly string[]).includes(file.type)) {
          toast.error(`${file.name}: format tidak didukung.`);
          continue;
        }
        if (file.size > MEDIA_MAX_BYTES) {
          toast.error(`${file.name}: file terlalu besar.`);
          continue;
        }

        const objectPath = buildMediaPath(ownerId, kind, file.name);
        const { error } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(objectPath, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          toast.error(`${file.name}: upload gagal — ${error.message}`);
          continue;
        }

        const { data } = await supabase.storage
          .from(MEDIA_BUCKET)
          .createSignedUrl(objectPath, 60 * 60);

        setUploadedHere((paths) => [...paths, objectPath]);
        setEntries((list) => [
          ...list,
          { path: objectPath, url: data?.signedUrl ?? null },
        ]);
      }

      toast.success("Gambar terunggah. Simpan form untuk memakainya.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(path: string) {
    setEntries((list) => list.filter((entry) => entry.path !== path));
    await discardIfUnsaved(path);
  }

  function move(index: number, delta: number) {
    setEntries((list) => {
      const next = [...list];
      const target = index + delta;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">
        {label}
      </span>

      <input type="hidden" name={name} value={current} />

      <div className="flex flex-col gap-3 rounded-[10px] border border-dashed border-input p-4">
        {entries.length ? (
          <ul className="flex flex-wrap gap-3">
            {entries.map((entry, index) => (
              <li
                key={entry.path}
                className="flex flex-col gap-1.5 rounded-lg border border-border p-2"
              >
                <div className="relative h-16 w-24 overflow-hidden rounded bg-surface-alt">
                  {entry.url ? (
                    <Image
                      src={entry.url}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-text-tertiary">
                      <ImagePlus className="size-4" />
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1">
                  <div className="flex gap-0.5">
                    <button
                      type="button"
                      aria-label={`Geser gambar ${index + 1} ke kiri`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      className="rounded p-1 text-text-secondary hover:text-primary disabled:opacity-30"
                    >
                      <ArrowLeft className="size-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Geser gambar ${index + 1} ke kanan`}
                      disabled={index === entries.length - 1}
                      onClick={() => move(index, 1)}
                      className="rounded p-1 text-text-secondary hover:text-primary disabled:opacity-30"
                    >
                      <ArrowRight className="size-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`Hapus gambar ${index + 1}`}
                    onClick={() => void handleRemove(entry.path)}
                    className="rounded p-1 text-text-secondary hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={MEDIA_MIME_TYPES.join(",")}
          disabled={busy}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) void handleFiles(files);
          }}
          className="text-xs text-text-secondary file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-xs file:font-semibold"
        />

        <p className="text-xs text-text-tertiary">
          {busy ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin" /> Mengunggah…
            </span>
          ) : unsaved ? (
            "Belum tersimpan — simpan form untuk memakainya."
          ) : (
            `Maksimal 12 gambar. ${describeMediaLimits()}`
          )}
        </p>
      </div>
    </div>
  );
}
