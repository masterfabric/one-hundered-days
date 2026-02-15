"use server";

import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { AppError, HttpStatus } from "@/lib/utils/errors";

/**
 * Upload avatar image to Supabase Storage
 * Accepts FormData with 'file' field
 */
export async function uploadAvatar(userId: string, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new AppError("No file provided", HttpStatus.BAD_REQUEST);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new AppError("Only image files are allowed", HttpStatus.BAD_REQUEST);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new AppError("File size must be less than 5MB", HttpStatus.BAD_REQUEST);
    }

    // Use admin client for storage operations
    const client = supabaseAdmin || supabaseServer;

    if (!client) {
      throw new AppError("Supabase client not available", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log("[uploadAvatar] Uploading to:", filePath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await client.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Replace if exists
      });

    if (uploadError) {
      console.error("[uploadAvatar] Storage upload error:", uploadError);
      
      // If bucket doesn't exist, provide helpful error
      if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("The resource was not found")) {
        throw new AppError(
          "Storage bucket 'avatars' not found. Please create it in Supabase Dashboard > Storage.",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      throw new AppError(
        `Failed to upload avatar: ${uploadError.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new AppError(
        "Failed to get avatar URL",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    console.log("[uploadAvatar] Upload successful:", urlData.publicUrl);

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error("[uploadAvatar] Error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to upload avatar: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
