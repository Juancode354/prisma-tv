import type { ComponentPropsWithoutRef } from "react";

type FieldProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
};

export default function Field({
  label,
  type = "text",
  className = "",
  ...props
}: FieldProps) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        {label}
      </span>
      <input
        type={type}
        className={`w-full rounded-lg border border-hairline bg-surface-1 px-4 py-3 text-sm text-ink-hi placeholder:text-ink-low outline-none transition-colors focus:border-prisma-500 ${className}`}
        {...props}
      />
    </label>
  );
}
