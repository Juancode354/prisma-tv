import Image from "next/image";
import { BRAND } from "@/lib/assets";
import ScreenAtmosphere from "@/components/ui/ScreenAtmosphere";
import RecBadge from "@/components/ui/RecBadge";
import Timecode from "@/components/ui/Timecode";
import SpectralLine from "@/components/ui/SpectralLine";
import Field from "@/components/ui/Field";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { createClient } from "@/lib/supabase/server";
import { login, signOut } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <ScreenAtmosphere />

      <RecBadge className="absolute top-5 left-5" />
      <Timecode className="absolute top-5 right-5" />

      <div className="relative z-10 w-full max-w-sm">
        {/* marca */}
        <div className="mb-8 flex flex-col items-center">
          <Image
            src={BRAND.logo}
            alt="Rede Prisma"
            width={640}
            height={640}
            priority
            className="h-auto w-44 max-w-[60vw]"
            style={{ filter: "drop-shadow(0 8px 30px rgba(124, 58, 237, 0.28))" }}
          />
          <SpectralLine className="mt-5" />
        </div>

        {user ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-lg border border-sucesso/40 bg-sucesso/10 px-4 py-3 text-center text-sm text-ink-hi">
              Conectado como {user.email}
            </p>

            <form action={signOut}>
              <PrimaryButton type="submit" className="mt-2">
                Sair
              </PrimaryButton>
            </form>
          </div>
        ) : (
          <form action={login} className="flex flex-col gap-4">
            <Field
              label="E-mail"
              type="email"
              name="email"
              placeholder="reporter@prismatv.br"
              required
              autoComplete="email"
            />
            <Field
              label="Senha"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <PrimaryButton type="submit" className="mt-2">
              Sintonizar
            </PrimaryButton>

            {error ? (
              <p className="rounded-lg border border-rec/40 bg-rec/10 px-4 py-3 text-sm text-ink-hi">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              className="mt-1 text-center font-mono text-xs tracking-[0.12em] text-ink-mid transition-colors hover:text-prisma-300"
            >
              Entrar por convite / QR Code
            </button>
          </form>
        )}

        {/* assinatura inferior */}
        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
          PRISMA TV · sinal privado da campanha
        </p>
      </div>
    </main>
  );
}
