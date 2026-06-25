type FieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
};

export default function Field({ label, type = "text", placeholder }: FieldProps) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.18em] text-ink-low">
        {label}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-hairline bg-surface-1 px-4 py-3 text-sm text-ink-hi placeholder:text-ink-low outline-none transition-colors focus:border-prisma-500"
      />
    </label>
  );
}