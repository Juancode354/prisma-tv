"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BRAND } from "@/lib/assets";
import ScreenAtmosphere from "./ScreenAtmosphere";
import RecBadge from "./RecBadge";
import Timecode from "./Timecode";
import SpectralLine from "./SpectralLine";

export default function PrismaSplash() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Remove a splash do DOM logo após a animação de saída terminar.
    const t = setTimeout(() => setHidden(true), 2700);
    return () => clearTimeout(t);
  }, []);

  if (hidden) return null;

  return (
    <div
      aria-hidden="true"
      className="splash-out fixed inset-0 z-[100] isolate flex flex-col items-center justify-center overflow-hidden bg-base"
    >
      <ScreenAtmosphere />

      <RecBadge className="absolute top-5 left-5" />
      <Timecode className="absolute top-5 right-5" />

      <div className="splash-mark relative z-10 flex flex-col items-center">
        <Image
          src={BRAND.logo}
          alt="Rede Prisma"
          width={640}
          height={640}
          priority
          className="h-auto w-60 max-w-[72vw]"
          style={{ filter: "drop-shadow(0 8px 34px rgba(124, 58, 237, 0.3))" }}
        />
        <SpectralLine className="splash-line mt-6" />
      </div>
    </div>
  );
}