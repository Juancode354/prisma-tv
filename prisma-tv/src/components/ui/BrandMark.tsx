import Image from "next/image";
import { BRAND } from "@/lib/assets";

type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <Image
        src={BRAND.logo}
        alt="Rede Prisma"
        width={640}
        height={640}
        priority
        className="h-auto w-56 max-w-[70vw]"
        style={{ filter: "drop-shadow(0 8px 30px rgba(124, 58, 237, 0.28))" }}
      />
    </div>
  );
}