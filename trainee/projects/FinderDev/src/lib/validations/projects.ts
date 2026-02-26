import { z } from "zod";

// Project status enum
export const projectStatusSchema = z.enum([
  "idea",
  "planning",
  "recruiting",
  "in_progress",
  "completed",
  "on_hold",
  "cancelled",
]);

// Tech stack item schema
export const techStackItemSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["frontend", "backend", "database", "devops", "other"]),
});

// Required role schema
export const requiredRoleSchema = z.object({
  role: z.enum([
    "frontend_developer",
    "backend_developer",
    "fullstack_developer",
    "ui_designer",
    "ux_designer",
    "product_manager",
    "devops_engineer",
    "other",
  ]),
  count: z.number().int().positive(),
  filled: z.number().int().nonnegative().default(0),
});

// Create project schema
export const createProjectSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(3).max(5000),
  shortDescription: z.string().max(300).optional(),
  status: projectStatusSchema.default("idea"),
  techStack: z.array(techStackItemSchema).min(1),
  requiredRoles: z.array(requiredRoleSchema).min(1),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// Update project schema (all fields optional except id)
export const updateProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(3).max(5000).optional(),
  shortDescription: z.string().max(300).optional(),
  status: projectStatusSchema.optional(),
  techStack: z.array(techStackItemSchema).optional(),
  requiredRoles: z.array(requiredRoleSchema).optional(),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Project filter schema
export const projectFilterSchema = z.object({
  search: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  status: z.array(projectStatusSchema).optional(),
  requiredRole: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

// Project query params schema
export const projectQuerySchema = z.object({
  search: z.string().optional(),
  tech: z.string().optional(), // comma-separated tech stack
  status: z.string().optional(), // comma-separated statuses
  role: z.string().optional(),
  tags: z.string().optional(), // comma-separated tags
  limit: z.string().optional(),
  offset: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectFilterInput = z.infer<typeof projectFilterSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type TechStackItem = z.infer<typeof techStackItemSchema>;
export type RequiredRole = z.infer<typeof requiredRoleSchema>;

