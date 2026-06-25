import ScreenAtmosphere from "@/components/ui/ScreenAtmosphere";
import RecBadge from "@/components/ui/RecBadge";
import Timecode from "@/components/ui/Timecode";
import SpectralLine from "@/components/ui/SpectralLine";
import BrandMark from "@/components/ui/BrandMark";

export default function Home() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden flex flex-col items-center justify-center px-6 text-center">
      <ScreenAtmosphere />

      <RecBadge className="absolute top-5 left-5" />
      <Timecode className="absolute top-5 right-5" />

      <BrandMark />

      <p className="mt-5 max-w-xs text-sm text-ink-mid">
        Sala de controle da Rede Prisma. Sinal privado da campanha.
      </p>

      <SpectralLine className="mt-10" />
    </main>
  );
}