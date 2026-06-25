type RecBadgeProps = {
  className?: string;
};

export default function RecBadge({ className = "" }: RecBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-rec ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-rec animate-pulse" />
      REC
    </div>
  );
}