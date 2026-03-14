import { z } from "zod";

// Create conversation schema
export const createConversationSchema = z.object({
  projectId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  participantIds: z.array(z.string().uuid()).length(2), // Must have exactly 2 participants
});

// Send message schema
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  messageType: z.enum(["text", "system"]).default("text"),
});

// Message filter schema
export const messageFilterSchema = z.object({
  conversationId: z.string().uuid(),
  limit: z.number().int().positive().max(100).default(50),
  offset: z.number().int().nonnegative().default(0),
  before: z.string().optional(), // Message ID to fetch messages before
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessageFilterInput = z.infer<typeof messageFilterSchema>;

