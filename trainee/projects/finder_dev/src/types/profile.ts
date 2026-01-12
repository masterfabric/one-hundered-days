// Type definitions for User Profile

export type TechnologyCategory = "Frontend" | "Backend" | "Design" | "Tool" | "Mobile";

export interface UserSkill {
  id: number;
  name: string;
  category: TechnologyCategory;
}

export interface SocialLinks {
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  location?: string;
  socialLinks?: SocialLinks;
  skills?: UserSkill[];
  createdAt?: string;
  updatedAt?: string;
}
