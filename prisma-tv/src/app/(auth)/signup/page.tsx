"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/assets";
import { createClient } from "@/lib/supabase/client";
import ScreenAtmosphere from "@/components/ui/ScreenAtmosphere";
import RecBadge from "@/components/ui/RecBadge";
import Timecode from "@/components/ui/Timecode";
import SpectralLine from "@/components/ui/SpectralLine";
import Field from "@/components/ui/Field";
import PrimaryButton from "@/components/ui/PrimaryButton";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      const message = signUpError.message.toLowerCase();

      if (message.includes("already") || message.includes("registered")) {
        setError("Este e-mail já parece existir.");
        return;
      }

      setError(`Erro do Supabase: ${signUpError.message}`);
      return;
    }

    if (data.session) {
      setStatus("Conta criada com sessão iniciada.");
      return;
    }

    setStatus("Conta criada, mas talvez precise de confirmação manual.");
  }

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <ScreenAtmosphere />

      <RecBadge className="absolute top-5 left-5" />
      <Timecode className="absolute top-5 right-5" />

      <div className="relative z-10 w-full max-w-sm">
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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Field
            label="E-mail"
            type="email"
            name="email"
            placeholder="reporter@prismatv.br"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
          <Field
            label="Senha"
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />

          <PrimaryButton type="submit" className="mt-2" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </PrimaryButton>

          {error ? (
            <p className="rounded-lg border border-rec/40 bg-rec/10 px-4 py-3 text-sm text-ink-hi">
              {error}
            </p>
          ) : null}

          {status ? (
            <p className="rounded-lg border border-sucesso/40 bg-sucesso/10 px-4 py-3 text-sm text-ink-hi">
              {status}
            </p>
          ) : null}

          <Link
            href="/login"
            className="mt-1 text-center font-mono text-xs tracking-[0.12em] text-ink-mid transition-colors hover:text-prisma-300"
          >
            Já tenho conta
          </Link>
        </form>

        <p className="mt-10 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ink-low">
          PRISMA TV · sinal privado da campanha
        </p>
      </div>
    </main>
  );
}
