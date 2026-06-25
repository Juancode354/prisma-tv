type SpectralLineProps = {
  className?: string;
};

export default function SpectralLine({ className = "" }: SpectralLineProps) {
  return (
    <div
      className={`h-px w-44 bg-gradient-to-r from-transparent via-prisma-500 to-transparent ${className}`}
    />
  );
}