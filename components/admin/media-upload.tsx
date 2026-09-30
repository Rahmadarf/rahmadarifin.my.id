"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_BUCKET,
  MEDIA_MAX_BYTES,
  MEDIA_MIME_TYPES,
  buildMediaPath,
  describeMediaLimits,
  type MediaKind,
} from "@/lib/media/paths";

// Uploads go straight from the browser to Storage, then the form submits only
// the object path. That keeps the file out of the Server Action request body,
// and Storage RLS still checks that the path starts with this user's UUID.
//
// The cost of uploading before the form is saved is that a file can reach the
// bucket without ever reaching a row. Three things keep that from piling up:
//
//   1. Replacing or removing an upload that was never saved deletes it here,
//      immediately.
//   2. Leaving the page with an unsaved change is confirmed first.
//   3. Anything that still slips through is collected by the server-side sweep
//      in lib/media/sweep.ts.
//
// `initialPath` is the path currently stored on the row. It updates after a
// successful save, which is what makes rule 1 safe: an upload is only deleted
// here while it differs from what the row holds.
export function MediaUpload({
  name,
  ownerId,
  kind,
  initialPath,
  initialUrl,
  label,
}: {
  name: string;
  ownerId: string;
  kind: MediaKind;
  initialPath: string | null;
  initialUrl: string | null;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(initialPath ?? "");
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  // Paths this component uploaded, none of which are on the row yet.
  const [uploadedHere, setUploadedHere] = useState<string[]>([]);

  const unsaved = path !== (initialPath ?? "");

  useEffect(() => {
    if (!unsaved) return;

    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  // Only discards an upload that this component made and that the row does not
  // reference. Media already stored on the row is left for the Server Action to
  // remove after a successful save.
  async function discardIfUnsaved(candidate: string) {
    if (!candidate || candidate === initialPath) return;
    if (!uploadedHere.includes(candidate)) return;

    setUploadedHere((paths) => paths.filter((p) => p !== candidate));
    const supabase = createClient();
    await supabase.storage.from(MEDIA_BUCKET).remove([candidate]);
  }

  async function handleFile(file: File) {
    if (!(MEDIA_MIME_TYPES as readonly string[]).includes(file.type)) {
      toast.error(`Format tidak didukung. ${describeMediaLimits()}`);
      return;
    }
    if (file.size > MEDIA_MAX_BYTES) {
      toast.error(`File terlalu besar. ${describeMediaLimits()}`);
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const objectPath = buildMediaPath(ownerId, kind, file.name);

      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(objectPath, file, {
          contentType: file.type,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        toast.error(`Upload gagal: ${error.message}`);
        return;
      }

      const { data } = await supabase.storage
        .from(MEDIA_BUCKET)
        .createSignedUrl(objectPath, 60 * 60);

      const replaced = path;
      setUploadedHere((paths) => [...paths, objectPath]);
      setPath(objectPath);
      setPreviewUrl(data?.signedUrl ?? null);
      await discardIfUnsaved(replaced);

      toast.success("Gambar terunggah. Simpan form untuk memakainya.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    const removed = path;
    setPath("");
    setPreviewUrl(null);
    await discardIfUnsaved(removed);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-text-secondary">
        {label}
      </span>

      <input type="hidden" name={name} value={path} />

      <div className="flex flex-wrap items-center gap-4 rounded-[10px] border border-dashed border-input p-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-alt">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt=""
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-text-tertiary">
              <ImagePlus className="size-5" />
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={MEDIA_MIME_TYPES.join(",")}
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
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
              describeMediaLimits()
            )}
          </p>
        </div>

        {path ? (
          <button
            type="button"
            onClick={() => void handleRemove()}
            className="flex items-center gap-1.5 rounded-md border border-input px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:border-destructive/40 hover:text-destructive"
          >
            <X className="size-3" />
            Hapus
          </button>
        ) : null}
      </div>
    </div>
  );
}
