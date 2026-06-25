// Atmosfera de "tela/sinal antigo": gradiente, ruído, scanlines, vinheta e varredura.
// Tudo fica no fundo (atrás do conteúdo) e não captura cliques.
export default function ScreenAtmosphere() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* 1) brilho central -> escurecendo nas bordas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 35%, #101019 0%, #0B0B0F 55%, #060608 100%)",
        }}
      />

      {/* 2) ruído (estática de TV) com leve tremor */}
      <svg className="crt-flicker absolute inset-0 h-full w-full opacity-[0.08]">
        <filter id="atmo-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#atmo-noise)" />
      </svg>

      {/* 3) scanlines discretas */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 2px, transparent 3px)",
        }}
      />

      {/* 4) vinheta nas bordas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 95% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* 5) varredura de TV antiga — POR CIMA da vinheta, fina e fraca, vai até a base */}
      <div
        className="crt-sweep absolute inset-x-0 top-0 h-8"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(255,255,255,0.04) 50%, transparent)",
        }}
      />
    </div>
  );
}