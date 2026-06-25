type TimecodeProps = {
  value?: string;
  className?: string;
};

export default function Timecode({
  value = "00:00:00",
  className = "",
}: TimecodeProps) {
  return (
    <div className={`font-mono text-xs tracking-[0.2em] text-ink-low ${className}`}>
      {value}
    </div>
  );
}