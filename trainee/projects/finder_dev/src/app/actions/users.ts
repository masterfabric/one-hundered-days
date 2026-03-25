"use server";

import {
  updateUserProfileSchema,
  type UpdateUserProfileInput,
} from "@/lib/validations/users";
import { AppError, ErrorMessages, HttpStatus } from "@/lib/utils/errors";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";

// Define types for Supabase response
interface FeaturedDeveloperResponse {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  github_url: string | null;
  updated_at?: string;
}

/**
 * Get featured developers for homepage
 */
export async function getFeaturedDevelopers(limit: number = 4) {
  try {
    const client = (supabaseAdmin || supabaseServer) as any;

    // Keep query schema-safe: avoid FK-dependent joins here.
    const { data: rawData, error } = await client
      .from("profiles")
      .select("id, username, full_name, avatar_url, bio, website_url, github_url, updated_at")
      .order("updated_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured developers:", error);
      return { success: false, data: [] };
    }

    // Cast data
    const profiles = (rawData as unknown as FeaturedDeveloperResponse[]) || [];
    const profileIds = profiles.map((p) => p.id).filter(Boolean);

    const ownedCountByUser = new Map<string, number>();
    const acceptedMemberCountByUser = new Map<string, number>();

    if (profileIds.length > 0) {
      const [ownedProjectsResult, acceptedMembersResult] = await Promise.all([
        client
          .from("projects")
          .select("owner_id")
          .in("owner_id", profileIds),
        client
          .from("project_members")
          .select("user_id")
          .in("user_id", profileIds)
          .eq("status", "accepted"),
      ]);

      (ownedProjectsResult.data || []).forEach((row: any) => {
        const key = row.owner_id as string;
        ownedCountByUser.set(key, (ownedCountByUser.get(key) || 0) + 1);
      });

      (acceptedMembersResult.data || []).forEach((row: any) => {
        const key = row.user_id as string;
        acceptedMemberCountByUser.set(key, (acceptedMemberCountByUser.get(key) || 0) + 1);
      });
    }

    // Transform data to match component expected format
    const colors = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
    ];
    const avatars = ["👨‍💻", "👩‍💻", "🧑‍💻", "👩‍🔬", "🧑‍🔬"];
    const roles = ["Full Stack Developer", "Frontend Developer", "Backend Developer", "Mobile Developer", "DevOps Engineer"];

    const transformedData = profiles.map((profile, index) => {
      const ownedCount = ownedCountByUser.get(profile.id) || 0;
      const memberCount = acceptedMemberCountByUser.get(profile.id) || 0;
      const totalProjects = ownedCount + memberCount;

      return {
        id: profile.id,
        name: profile.full_name || profile.username,
        username: profile.username,
        role: profile.bio?.split("|")[0]?.trim() || roles[index % roles.length],
        avatar: profile.avatar_url || avatars[index % avatars.length],
        skills: [], // Could be fetched from a skills table if exists
        projects: totalProjects,
        rating: 4.5 + (Math.random() * 0.5), // Placeholder rating
        color: colors[index % colors.length],
        bio: profile.bio,
        githubUrl: profile.github_url,
        websiteUrl: profile.website_url,
      };
    });

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Failed to fetch featured developers:", error);
    return { success: false, data: [] };
  }
}

/**
 * Update user profile
 */
/**
 * Sync profile ID with auth user ID
 * This function updates the profile's ID to match the current auth user's ID
 */
async function syncProfileId(oldId: string, newId: string) {
  try {
    if (!supabaseAdmin) {
      throw new AppError("Admin client required for ID sync", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    console.log("[syncProfileId] ID senkronizasyonu başlatılıyor:", oldId, "->", newId);

    // First, get the profile data
    const { data: oldProfile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", oldId)
      .single();

    if (fetchError || !oldProfile) {
      throw new AppError(
        `Profile with ID ${oldId} not found`,
        HttpStatus.NOT_FOUND
      );
    }

    // Check if profile with new ID already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", newId)
      .maybeSingle();

    if (existingProfile) {
      // If profile with new ID exists, we need to merge or delete the old one
      console.warn("[syncProfileId] Yeni ID ile profil zaten var, eski profil silinecek");
      // Delete old profile (data will be merged into existing one if needed)
      await supabaseAdmin
        .from("profiles")
        .delete()
        .eq("id", oldId);
      
      return { success: true, merged: true };
    }

    // Update the profile ID
    // Since ID is primary key, we need to delete and recreate
    const { id, ...profileData } = oldProfile as any;
    
    // Delete old profile
    const { error: deleteError } = await (supabaseAdmin as any)
      .from("profiles")
      .delete()
      .eq("id", oldId);

    if (deleteError) {
      throw new AppError(
        `Failed to delete old profile: ${deleteError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Create new profile with correct ID
    const { data: newProfile, error: createError } = await (supabaseAdmin as any)
      .from("profiles")
      .insert({
        ...profileData,
        id: newId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      throw new AppError(
        `Failed to create synced profile: ${createError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    console.log("[syncProfileId] ID senkronizasyonu tamamlandı");
    return { success: true, data: newProfile };
  } catch (error) {
    console.error("[syncProfileId] Hata:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to sync profile ID: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export async function updateUserProfile(input: UpdateUserProfileInput & { id: string }) {
  try {
    const validatedData = updateUserProfileSchema.parse(input);
    const { id, ...updateData } = input;

    const client = (supabaseAdmin || supabaseServer) as any;

    // Check if profile ID matches auth user ID
    // If not, sync the ID first
    const currentProfile = await getUserProfile(id);
    if (currentProfile.success && currentProfile.data?._needsIdSync) {
      console.log("[updateUserProfile] ID senkronizasyonu gerekli, yapılıyor...");
      const syncResult = await syncProfileId(currentProfile.data._currentId, id);
      if (!syncResult.success) {
        throw new AppError("ID senkronizasyonu başarısız", HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const updatePayload: Record<string, unknown> = {};

    // Yeni Supabase şemasına göre profiles tablosunu kullanıyoruz
    // displayName  -> full_name
    // avatarUrl    -> avatar_url
    // bio          -> bio
    // socialLinks  -> website_url / github_url
    if (updateData.displayName !== undefined) {
      updatePayload.full_name = updateData.displayName;
    }
    if (updateData.bio !== undefined) updatePayload.bio = updateData.bio;
    if (updateData.avatarUrl !== undefined) {
      updatePayload.avatar_url = updateData.avatarUrl || null;
    }
    if (updateData.visibility !== undefined) {
      updatePayload.visibility = updateData.visibility;
    }

    // Opsiyonel sosyal linkleri uygun kolonlara map ediyoruz
    if (updateData.socialLinks) {
      if (updateData.socialLinks.website !== undefined) {
        updatePayload.website_url = updateData.socialLinks.website || null;
      }
      if (updateData.socialLinks.github !== undefined) {
        updatePayload.github_url = updateData.socialLinks.github || null;
      }
    }

    updatePayload.updated_at = new Date().toISOString();

    // Ensure we're updating with the correct ID (auth user ID)
    const { data, error } = await client
      .from("profiles")
      // @ts-ignore - Supabase type inference issue
      .update(updatePayload as any)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to update profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    if (!data) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    // Verify ID matches after update
    if (data.id !== id) {
      console.warn("[updateUserProfile] UYARI: Güncelleme sonrası ID eşleşmiyor! Profil ID:", data.id, "Hedef ID:", id);
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Get user profile by ID
 */
/**
 * Get user email from auth.users (admin only)
 */
async function getUserEmail(userId: string): Promise<string | null> {
  try {
    if (!supabaseAdmin) {
      console.warn("[getUserEmail] Admin client yok, email alınamıyor");
      return null;
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !user) {
      console.error("[getUserEmail] Email alınamadı:", error);
      return null;
    }

    return user.email || null;
  } catch (error) {
    console.error("[getUserEmail] Hata:", error);
    return null;
  }
}

/**
 * Find profile by email (fallback mechanism)
 */
async function findProfileByEmail(email: string, excludeId?: string) {
  try {
    const client = (supabaseAdmin || supabaseServer) as any;
    
    // Note: We can't directly JOIN auth.users, but we can search profiles
    // If profiles table has email column, use it. Otherwise, we'll need to match via username
    // For now, we'll try to find profiles that might match the email pattern
    
    // Since we can't JOIN, we'll need to get user ID from email first
    if (!supabaseAdmin) {
      return null;
    }

    // Get user by email from auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error("[findProfileByEmail] User list error:", listError);
      return null;
    }

    const matchingUser = users?.find(u => u.email === email);
    if (!matchingUser) {
      console.log("[findProfileByEmail] Email ile kullanıcı bulunamadı:", email);
      return null;
    }

    // Now find profile with this user ID
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("*")
      .eq("id", matchingUser.id)
      .limit(1)
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    return profile;
  } catch (error) {
    console.error("[findProfileByEmail] Hata:", error);
    return null;
  }
}

export async function getUserProfile(userId: string, userEmail?: string): Promise<{ success: boolean; data: any | null; error?: string }> {
  try {
    console.log("[getUserProfile] Kullanıcı ID:", userId);
    
    // RLS bypass için admin client kullan (varsa), yoksa normal client kullan
    const client = (supabaseAdmin || supabaseServer) as any;
    console.log("[getUserProfile] Supabase client kullanılıyor:", supabaseAdmin ? "Admin (RLS bypass)" : "Server (RLS active)");

    // First, try to get profile by ID
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .limit(1)
      .maybeSingle();

    // If profile found by ID, check if ID matches auth.users.id
    if (data) {
      // Verify that the profile ID matches the auth user ID
      if (data.id === userId) {
        console.log("[getUserProfile] Profil ID ile bulundu:", data.id);
        return { success: true, data };
      } else {
        console.warn("[getUserProfile] Profil ID eşleşmiyor! Profil ID:", data.id, "Auth ID:", userId);
        // ID mismatch - we'll try email fallback below
      }
    }

    // If profile not found by ID or ID mismatch, try email fallback
    if (!data || data.id !== userId) {
      console.log("[getUserProfile] ID ile profil bulunamadı, email fallback deneniyor...");
      
      // Get user email if not provided
      let email: string | null = userEmail || null;
      if (!email) {
        email = await getUserEmail(userId);
      }

      if (email) {
        const profileByEmail = await findProfileByEmail(email, userId);
        if (profileByEmail) {
          console.log("[getUserProfile] Profil email ile bulundu:", profileByEmail.id);
          
          // If profile ID doesn't match, we need to sync it
          if (profileByEmail.id !== userId) {
            console.warn("[getUserProfile] Profil ID senkronizasyonu gerekli! Profil ID:", profileByEmail.id, "Auth ID:", userId);
            // Return the profile but note that ID sync is needed
            return { 
              success: true, 
              data: { ...profileByEmail, _needsIdSync: true, _currentId: profileByEmail.id, _targetId: userId } 
            };
          }
          
          return { success: true, data: profileByEmail };
        }
      }
    }

    // Handle errors
    if (error) {
      console.error("[getUserProfile] Supabase hatası:", error);
      
      // Handle specific error codes
      if (error.code === "PGRST116") {
        console.log("[getUserProfile] Profil bulunamadı (PGRST116)");
        return { success: false, data: null, error: "Profile not found" };
      }
      
      throw new AppError(
        `Failed to fetch profile: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // No profile found
    console.log("[getUserProfile] Profil bulunamadı (data null)");
    return { success: false, data: null, error: "Profile not found" };
  } catch (error) {
    console.error("[getUserProfile] Hata yakalandı:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Search users with filtering
 */
export async function searchUsers(query: Record<string, string | undefined>) {
  try {
    console.log("[searchUsers] Fonksiyon çağrıldı, query:", query);
    
    const limit = parseInt(query.limit || "20", 10);
    const offset = parseInt(query.offset || "0", 10);

    console.log("[searchUsers] Limit:", limit, "Offset:", offset);

    // RLS bypass için admin client kullan (varsa), yoksa normal client kullan
    const client = (supabaseAdmin || supabaseServer) as any;
    console.log("[searchUsers] Supabase client kullanılıyor:", supabaseAdmin ? "Admin (RLS bypass)" : "Server (RLS active)");

    // Yeni şemada users yerine profiles tablosu var
    let queryBuilder = client.from("profiles").select("*", {
      count: "exact",
    });

    const searchTerm = (query.search || "").trim().toLowerCase();

    // Search varken geniş pencere çekip bellek içinde çok alanlı filtreleme yapıyoruz.
    // Böylece gelecekte eklenecek uzmanlık alanları da (skills/expertise vb.) kapsanabilir.
    if (searchTerm) {
      queryBuilder = queryBuilder.limit(1000);
    } else {
      queryBuilder = queryBuilder.range(offset, offset + limit - 1);
    }

    // Order by updated_at descending (profiles table doesn't have created_at in current schema)
    queryBuilder = queryBuilder.order("updated_at", { ascending: false, nullsFirst: false });

    console.log("[searchUsers] Supabase sorgusu gönderiliyor...");
    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error("[searchUsers] Supabase hatası:", error);
      throw new AppError(
        `Failed to search users: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const rawUsers = (data || []) as Array<Record<string, unknown>>;

    const toSearchableTokens = (value: unknown): string[] => {
      if (value == null) return [];
      if (Array.isArray(value)) {
        return value.flatMap((item) => toSearchableTokens(item));
      }
      if (typeof value === "string") {
        const raw = value.trim();
        if (!raw) return [];
        if ((raw.startsWith("[") && raw.endsWith("]")) || (raw.startsWith("{") && raw.endsWith("}"))) {
          try {
            const normalized = raw.startsWith("{") ? `[${raw.slice(1, -1)}]` : raw;
            const parsed = JSON.parse(normalized);
            return toSearchableTokens(parsed);
          } catch {
            // Fallback to plain tokenization below.
          }
        }
        return raw
          .split(",")
          .map((token) => token.replace(/[\[\]"]/g, "").trim())
          .filter(Boolean);
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return [String(value)];
      }
      if (typeof value === "object") {
        return Object.values(value as Record<string, unknown>).flatMap((item) => toSearchableTokens(item));
      }
      return [];
    };

    const matchesSearch = (user: Record<string, unknown>, term: string) => {
      if (!term) return true;
      const directFields = [
        user.id,
        user.full_name,
        user.username,
        user.user_tag,
      ];
      const haystack = directFields
        .flatMap((field) => toSearchableTokens(field))
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    };

    const filteredUsers = searchTerm
      ? rawUsers.filter((user) => matchesSearch(user, searchTerm))
      : rawUsers;

    const paginatedUsers = searchTerm
      ? filteredUsers.slice(offset, offset + limit)
      : filteredUsers;

    const total = searchTerm ? filteredUsers.length : count || 0;
    const usersWithEmail = await Promise.all(
      paginatedUsers.map(async (user) => {
        const userId = typeof user.id === "string" ? user.id : "";
        const email = userId ? await getUserEmail(userId) : null;
        return {
          ...user,
          email,
        };
      })
    );

    console.log("[searchUsers] Başarılı! Veri sayısı:", paginatedUsers.length, "Toplam:", total);

    return {
      success: true,
      data: usersWithEmail,
      pagination: {
        total,
        limit,
        offset,
        hasMore: total > offset + limit,
      },
    };
  } catch (error) {
    console.error("[searchUsers] Hata yakalandı:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to search users: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
