import { z } from "zod";

// Skill schema
export const skillSchema = z.object({
  name: z.string().min(1).max(50),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  category: z.enum([
    "frontend",
    "backend",
    "fullstack",
    "design",
    "devops",
    "mobile",
    "other",
  ]),
});

// Social links schema
export const socialLinksSchema = z.object({
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

// Update user profile schema
export const updateUserProfileSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  skills: z.array(skillSchema).optional(),
  socialLinks: socialLinksSchema.optional(),
  availableForProjects: z.boolean().optional(),
  timezone: z.string().max(50).optional(),
});

// User search filter schema
export const userSearchFilterSchema = z.object({
  search: z.string().optional(),
  skills: z.array(z.string()).optional(),
  availableForProjects: z.boolean().optional(),
  location: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

// User query params schema
export const userQuerySchema = z.object({
  search: z.string().optional(),
  skills: z.string().optional(), // comma-separated skills
  available: z.string().optional(), // "true" or "false"
  location: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type UserSearchFilterInput = z.infer<typeof userSearchFilterSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SocialLinks = z.infer<typeof socialLinksSchema>;

