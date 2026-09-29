"use client";

import { useRef, useState } from "react";
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

// Uploads straight from the browser to Storage, then submits only the object
// path with the form. Going through the browser client keeps the file out of
// the Server Action request body, and Storage RLS still checks that the path
// starts with this user's UUID.
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

      setPath(objectPath);
      setPreviewUrl(data?.signedUrl ?? null);
      toast.success("Gambar terunggah. Simpan form untuk memakainya.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
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
            ) : (
              describeMediaLimits()
            )}
          </p>
        </div>

        {path ? (
          <button
            type="button"
            onClick={() => {
              setPath("");
              setPreviewUrl(null);
            }}
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
