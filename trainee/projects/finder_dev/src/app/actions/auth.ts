"use server";

import { createClient } from "@/utils/supabase/server";

type AuthResult = {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Hatali e-posta veya sifre.";
  }
  if (lower.includes("email not confirmed")) {
    return "Lutfen once e-posta adresinizi onaylayin.";
  }
  if (lower.includes("already registered")) {
    return "Bu e-posta adresi zaten kayitli.";
  }
  if (lower.includes("password")) {
    return "Sifre gereksinimleri karsilanmiyor.";
  }
  return "Kimlik dogrulama islemi sirasinda bir hata olustu.";
}

export async function signInWithPasswordAction(
  input: { email: string; password: string }
): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase();
  const password = input.password?.trim();

  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, error: "Gecerli bir e-posta adresi girin." };
  }

  if (!password) {
    return { success: false, error: "Sifre alani bos birakilamaz." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  return { success: true };
}

export async function signUpWithPasswordAction(input: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const fullName = input.fullName?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password?.trim();

  if (!fullName) {
    return { success: false, error: "Ad soyad alani bos birakilamaz." };
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return { success: false, error: "Gecerli bir e-posta adresi girin." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Sifre en az 6 karakter olmali." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: mapAuthError(error.message) };
  }

  const needsEmailConfirmation = Boolean(data.user && !data.session);
  return { success: true, needsEmailConfirmation };
}
