"use server";

import {
  createConversationSchema,
  sendMessageSchema,
  type CreateConversationInput,
  type SendMessageInput,
} from "@/lib/validations/chat";
import { AppError, ErrorMessages, HttpStatus } from "@/lib/utils/errors";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Create a new conversation
 */
export async function createConversation(input: CreateConversationInput) {
  try {
    const validatedData = createConversationSchema.parse(input);

    const { data, error } = await (supabaseServer
      .from("conversations" as any) as any)
      .insert({
        project_id: validatedData.projectId || null,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to create conversation: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Katılımcıları conversation_participants tablosuna ekle
    if (validatedData.participantIds?.length) {
      const participantsPayload = validatedData.participantIds.map(
        (participantId) => ({
          conversation_id: data.id,
          user_id: participantId,
        })
      );

      const { error: participantsError } = await (supabaseServer
        .from("conversation_participants" as any) as any)
        .insert(participantsPayload);

      if (participantsError) {
        throw new AppError(
          `Failed to add conversation participants: ${participantsError.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }

    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to create conversation: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Send a message
 */
export async function sendMessage(input: SendMessageInput) {
  try {
    const validatedData = sendMessageSchema.parse(input);

    // TODO: Get authenticated user ID from session/auth
    // For now, using a placeholder - replace with actual auth
    const userId = "00000000-0000-0000-0000-000000000000"; // Replace with actual user ID

    // Yeni mesaj şeması:
    // - sender_id (user_id yerine)
    // - content
    // - is_read (varsayılan false)
    const { data, error } = await (supabaseServer
      .from("messages" as any) as any)
      .insert({
        conversation_id: validatedData.conversationId,
        sender_id: userId,
        content: validatedData.content,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(
        `Failed to send message: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Update conversation updated_at timestamp
    await (supabaseServer
      .from("conversations" as any) as any)
      .update({ updated_at: new Date().toISOString() })
      .eq("id", validatedData.conversationId);

    return { success: true, data };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to send message: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  limit: number = 50,
  offset: number = 0,
  before?: string
) {
  try {
    let queryBuilder = (supabaseServer
      .from("messages" as any) as any)
      .select("*", { count: "exact" })
      .eq("conversation_id", conversationId);

    // If before is specified, get messages before that message
    if (before) {
      // First get the created_at of the before message
      const { data: beforeMessage } = await (supabaseServer
        .from("messages" as any) as any)
        .select("created_at")
        .eq("id", before)
        .single();

      if (beforeMessage) {
        queryBuilder = queryBuilder.lt("created_at", (beforeMessage as any).created_at);
      }
    }

    const { data, error, count } = await queryBuilder
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new AppError(
        `Failed to fetch messages: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // Reverse to get chronological order (oldest first)
    const messages = (data || []).reverse();

    return {
      success: true,
      data: messages,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to fetch messages: ${error instanceof Error ? error.message : "Unknown error"}`,
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
