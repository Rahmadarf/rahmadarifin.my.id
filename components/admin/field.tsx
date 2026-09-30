import { cn } from "@/lib/utils";

// 16px on small screens on purpose: iOS Safari zooms the page when a focused
// control's text is smaller than that. It drops back to 14px from `sm` up.
const CONTROL_CLASS =
  "w-full rounded-[10px] border border-input bg-background px-3.5 py-2.5 font-sans text-base text-foreground placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-semibold text-text-secondary"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-text-tertiary">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  name,
  error,
  className,
  ...props
}: React.ComponentProps<"input"> & { name: string; error?: string }) {
  return (
    <input
      id={name}
      name={name}
      aria-invalid={error ? true : undefined}
      className={cn(CONTROL_CLASS, error && "border-destructive", className)}
      {...props}
    />
  );
}

export function TextAreaField({
  name,
  error,
  className,
  ...props
}: React.ComponentProps<"textarea"> & { name: string; error?: string }) {
  return (
    <textarea
      id={name}
      name={name}
      aria-invalid={error ? true : undefined}
      className={cn(
        CONTROL_CLASS,
        "min-h-24 resize-y",
        error && "border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export function SelectField({
  name,
  error,
  className,
  children,
  ...props
}: React.ComponentProps<"select"> & { name: string; error?: string }) {
  return (
    <select
      id={name}
      name={name}
      aria-invalid={error ? true : undefined}
      className={cn(CONTROL_CLASS, error && "border-destructive", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function StatusField({
  defaultValue = "draft",
  error,
}: {
  defaultValue?: string;
  error?: string;
}) {
  return (
    <Field
      label="Status"
      htmlFor="status"
      error={error}
      hint="Hanya konten published yang terbaca publik."
    >
      <SelectField name="status" defaultValue={defaultValue} error={error}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </SelectField>
    </Field>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="flex items-center gap-2.5 text-[13px] font-semibold text-text-secondary"
      >
        <input
          id={name}
          name={name}
          type="checkbox"
          defaultChecked={defaultChecked}
          className="size-4 rounded border-input accent-primary"
        />
        {label}
      </label>
      {hint ? <p className="text-xs text-text-tertiary">{hint}</p> : null}
    </div>
  );
}
