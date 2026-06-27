import Image from "next/image";
import { redirect } from "next/navigation";
import { BRAND } from "@/lib/assets";
import { createClient } from "@/lib/supabase/server";
import ScreenAtmosphere from "@/components/ui/ScreenAtmosphere";
import RecBadge from "@/components/ui/RecBadge";
import Timecode from "@/components/ui/Timecode";
import SpectralLine from "@/components/ui/SpectralLine";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { signOut } from "../(auth)/actions";

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role ? String(profile.role).toUpperCase() : null;

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <ScreenAtmosphere />

      <RecBadge className="absolute top-5 left-5" />
      <Timecode className="absolute top-5 right-5" />

      <section className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <Image
          src={BRAND.logo}
          alt="Rede Prisma"
          width={640}
          height={640}
          priority
          className="h-auto w-40 max-w-[58vw]"
          style={{ filter: "drop-shadow(0 8px 30px rgba(124, 58, 237, 0.28))" }}
        />
        <SpectralLine className="mt-5" />

        <div className="mt-8 w-full space-y-4 font-mono text-sm text-ink-hi">
          <div className="rounded-lg border border-prisma-500/30 bg-ink-hi/5 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-low">Usuário</p>
            <p className="mt-2 break-words text-base">{user.email}</p>
          </div>

          <div className="rounded-lg border border-prisma-500/30 bg-ink-hi/5 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-low">Perfil</p>
            {profileError || !profile ? (
              <p className="mt-2 text-rec">Perfil não encontrado ou inacessível.</p>
            ) : (
              <p className="mt-2 text-base">Papel: {role}</p>
            )}
          </div>

          <form action={signOut}>
            <PrimaryButton type="submit">Sair</PrimaryButton>
          </form>
        </div>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
          PRISMA TV · sinal privado da campanha
        </p>
      </section>
    </main>
  );
}
