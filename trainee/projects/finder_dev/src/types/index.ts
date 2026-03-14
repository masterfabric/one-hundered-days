/**
 * Shared TypeScript types across the application
 */

// User roles in projects
export type ProjectRole =
  | "frontend_developer"
  | "backend_developer"
  | "fullstack_developer"
  | "ui_designer"
  | "ux_designer"
  | "product_manager"
  | "devops_engineer"
  | "other";

// Project status
export type ProjectStatus =
  | "planning"
  | "recruiting"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

// Application status
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

// Skill level
export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

// Skill category
export type SkillCategory =
  | "frontend"
  | "backend"
  | "fullstack"
  | "design"
  | "devops"
  | "mobile"
  | "other";

// Message type
export type MessageType = "text" | "system";

// Tech stack category
export type TechStackCategory =
  | "frontend"
  | "backend"
  | "database"
  | "devops"
  | "other";

