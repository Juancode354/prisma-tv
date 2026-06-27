"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function clearSupabaseAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.getAll().forEach(({ name }) => {
    if (name.startsWith("sb-") && name.includes("auth-token")) {
      cookieStore.delete(name);
    }
  });
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      await clearSupabaseAuthCookies();
    }
  } catch {
    await clearSupabaseAuthCookies();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
