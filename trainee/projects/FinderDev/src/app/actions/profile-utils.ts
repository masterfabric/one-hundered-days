"use server";

import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { AppError, HttpStatus } from "@/lib/utils/errors";

/**
 * Check for duplicate profiles for a user
 */
export async function checkDuplicateProfiles(userId: string) {
  try {
    const client = supabaseAdmin || supabaseServer;
    
    const { data, error } = await client
      .from("profiles")
      .select("id, username, created_at")
      .eq("id", userId);

    if (error) {
      console.error("[checkDuplicateProfiles] Error:", error);
      return { hasDuplicates: false, count: 0, profiles: [] };
    }

    const count = data?.length || 0;
    const hasDuplicates = count > 1;

    return {
      hasDuplicates,
      count,
      profiles: data || [],
    };
  } catch (error) {
    console.error("[checkDuplicateProfiles] Error:", error);
    return { hasDuplicates: false, count: 0, profiles: [] };
  }
}

/**
 * Clean duplicate profiles - keeps the oldest one
 */
export async function cleanDuplicateProfiles(userId: string) {
  try {
    const client = supabaseAdmin || supabaseServer;
    
    // Get all profiles for this user, ordered by created_at
    const { data: profiles, error: fetchError } = await client
      .from("profiles")
      .select("id, username, created_at")
      .eq("id", userId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new AppError(
        `Failed to fetch profiles: ${fetchError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (!profiles || profiles.length <= 1) {
      return { success: true, deleted: 0, message: "No duplicates found" };
    }

    // Keep the first (oldest) profile, delete the rest
    const profilesToDelete = profiles.slice(1);
    const idsToDelete = profilesToDelete.map(p => p.id);

    const { error: deleteError } = await client
      .from("profiles")
      .delete()
      .in("id", idsToDelete);

    if (deleteError) {
      throw new AppError(
        `Failed to delete duplicates: ${deleteError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return {
      success: true,
      deleted: profilesToDelete.length,
      message: `Deleted ${profilesToDelete.length} duplicate profile(s)`,
    };
  } catch (error) {
    console.error("[cleanDuplicateProfiles] Error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to clean duplicates: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Create profile if it doesn't exist
 * NOTE: This function should only be called manually (e.g., from settings page)
 * It is NOT automatically called when profile is not found.
 * 
 * IMPORTANT: This function guarantees that profiles.id = auth.users.id
 */
export async function createProfileIfNotExists(userId: string, email?: string) {
  try {
    const client = supabaseAdmin || supabaseServer;
    
    if (!client) {
      throw new AppError(
        "Supabase client not available",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // First, check if profile exists with correct ID
    const { data: existingById, error: checkByIdError } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (checkByIdError && checkByIdError.code !== "PGRST116") {
      throw new AppError(
        `Failed to check profile: ${checkByIdError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // If profile exists with correct ID, return it
    if (existingById && existingById.id === userId) {
      console.log("[createProfileIfNotExists] Profil zaten var (ID eşleşiyor):", existingById.id);
      return { success: true, data: existingById, created: false };
    }

    // Check if profile exists with different ID (email fallback)
    if (email && supabaseAdmin) {
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const matchingUser = users?.find(u => u.email === email);
      
      if (matchingUser && matchingUser.id !== userId) {
        // User exists but with different ID - this shouldn't happen, but handle it
        console.warn("[createProfileIfNotExists] Email ile farklı ID bulundu:", matchingUser.id, "vs", userId);
      }

      // Check if profile exists with email's user ID
      if (matchingUser) {
        const { data: existingByEmailId } = await client
          .from("profiles")
          .select("*")
          .eq("id", matchingUser.id)
          .maybeSingle();

        if (existingByEmailId) {
          // Profile exists but ID doesn't match - need to sync
          console.warn("[createProfileIfNotExists] Profil farklı ID ile bulundu, senkronizasyon gerekli");
          // We'll create a new one with correct ID, but this should be handled by sync
          // For now, we'll proceed with creating new profile with correct ID
        }
      }
    }

    // Create new profile with guaranteed ID = auth.users.id
    const username = email ? email.split("@")[0] : `user_${userId.substring(0, 8)}`;
    
    console.log("[createProfileIfNotExists] Yeni profil oluşturuluyor, ID:", userId, "Username:", username);
    
    const { data: newProfile, error: createError } = await client
      .from("profiles")
      .insert({
        id: userId, // CRITICAL: ID must equal auth.users.id
        username: username,
        full_name: null,
        avatar_url: null,
        bio: null,
      })
      .select()
      .single();

    if (createError) {
      // If username conflict, try with timestamp
      if (createError.code === "23505") {
        const uniqueUsername = `${username}_${Date.now()}`;
        const { data: retryProfile, error: retryError } = await client
          .from("profiles")
          .insert({
            id: userId,
            username: uniqueUsername,
            full_name: null,
            avatar_url: null,
            bio: null,
          })
          .select()
          .single();

        if (retryError) {
          throw new AppError(
            `Failed to create profile: ${retryError.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }

        return { success: true, data: retryProfile, created: true };
      }

      throw new AppError(
        `Failed to create profile: ${createError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return { success: true, data: newProfile, created: true };
  } catch (error) {
    console.error("[createProfileIfNotExists] Error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to create profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
