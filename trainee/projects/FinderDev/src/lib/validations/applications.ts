import { z } from "zod";

// Application status enum
export const applicationStatusSchema = z.enum([
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);

// Create application schema
export const createApplicationSchema = z.object({
  projectId: z.string().uuid(),
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
  message: z.string().min(10).max(1000).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
});

// Update application status schema
export const updateApplicationStatusSchema = z.object({
  applicationId: z.string().uuid(),
  status: applicationStatusSchema,
  rejectionReason: z.string().max(500).optional(),
});

// Application filter schema
export const applicationFilterSchema = z.object({
  projectId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  status: z.array(applicationStatusSchema).optional(),
  role: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;
export type ApplicationFilterInput = z.infer<typeof applicationFilterSchema>;
export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

