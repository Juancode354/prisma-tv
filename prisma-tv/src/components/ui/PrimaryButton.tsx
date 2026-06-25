type PrimaryButtonProps = {
  children: React.ReactNode;
  className?: string;
};

export default function PrimaryButton({ children, className = "" }: PrimaryButtonProps) {
  return (
    <button
      type="button"
      className={`w-full rounded-lg bg-prisma-600 px-4 py-3 text-sm font-semibold tracking-wide text-ink-hi transition-colors hover:bg-prisma-500 ${className}`}
    >
      {children}
    </button>
  );
}