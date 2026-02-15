"use server";

import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { AppError, HttpStatus } from "@/lib/utils/errors";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
});

/**
 * Newsletter'e email ekle
 */
export async function subscribeNewsletter(email: string) {
  try {
    // Email validation
    const validatedData = newsletterSchema.parse({ email });

    // Admin client kullan (RLS'yi bypass eder - public newsletter için)
    const client = supabaseAdmin || supabaseServer;

    // Önce bu email zaten kayıtlı mı kontrol et
    const { data: existing } = await client
      .from("newsletter_subscriptions")
      .select("id, email")
      .eq("email", validatedData.email.toLowerCase())
      .maybeSingle();

    if (existing) {
      // Zaten kayıtlı ama hata fırlatma, başarılı gibi göster
      return { 
        success: true, 
        message: "Bu e-posta adresi zaten kayıtlı.",
        alreadySubscribed: true 
      };
    }

    // Yeni kayıt ekle
    const { data, error } = await client
      .from("newsletter_subscriptions")
      .insert({
        email: validatedData.email.toLowerCase(),
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Newsletter subscription error:", error);
      throw new AppError(
        `Newsletter kaydı başarısız: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return { 
      success: true, 
      message: "Newsletter'e başarıyla abone oldunuz!",
      data 
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new AppError(
        error.errors[0]?.message || "Geçersiz e-posta adresi",
        HttpStatus.BAD_REQUEST
      );
    }
    throw new AppError(
      `Newsletter kaydı başarısız: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
