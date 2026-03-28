/**
 * Supabase database types
 *
 * Not: En doğrusu bu dosyayı şu komutla üretmek:
 *   npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 * Burada paylaştığın SQL şemasına göre elle tanımladım.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string | null;
          status: string; // project_status enum
          tech_stack: string[] | null;
          looking_for: string[] | null;
          github_url: string | null;
          live_url: string | null;
          repo_url: string | null;
          demo_url: string | null;
          team_capacity: number | null;
          estimated_start_date: string | null;
          deadline: string | null;
          documentation_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description?: string | null;
          status?: string;
          tech_stack?: string[] | null;
          looking_for?: string[] | null;
          github_url?: string | null;
          live_url?: string | null;
          repo_url?: string | null;
          demo_url?: string | null;
          team_capacity?: number | null;
          estimated_start_date?: string | null;
          deadline?: string | null;
          documentation_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          tech_stack?: string[] | null;
          looking_for?: string[] | null;
          github_url?: string | null;
          live_url?: string | null;
          repo_url?: string | null;
          demo_url?: string | null;
          team_capacity?: number | null;
          estimated_start_date?: string | null;
          deadline?: string | null;
          documentation_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          about: string | null;
          website_url: string | null;
          github_url: string | null;
          linkedin_url: string | null;
          user_tag: string | null;
          visibility: "public" | "members_only";
          achievement_count: number;
          achievements_count: number;
          achievements: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          about?: string | null;
          website_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          user_tag?: string | null;
          visibility?: "public" | "members_only";
          achievement_count?: number;
          achievements_count?: number;
          achievements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          about?: string | null;
          website_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          user_tag?: string | null;
          visibility?: "public" | "members_only";
          achievement_count?: number;
          achievements_count?: number;
          achievements?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      technologies: {
        Row: {
          id: number;
          name: string;
          category: string; // enum, ama string olarak tipliyoruz
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_technologies: {
        Row: {
          project_id: string;
          technology_id: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          project_id: string;
          technology_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string;
          technology_id?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string | null;
          user_id: string | null;
          role_title: string | null;
          status: string; // member_status enum
          team_role: string;
          granted_by: string | null;
          granted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          role_title?: string | null;
          status?: string;
          team_role?: string;
          granted_by?: string | null;
          granted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          user_id?: string | null;
          role_title?: string | null;
          status?: string;
          team_role?: string;
          granted_by?: string | null;
          granted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievement_definitions: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string;
          category: string;
          xp_reward: number;
          is_repeatable: boolean;
          is_visible: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description: string;
          category?: string;
          xp_reward?: number;
          is_repeatable?: boolean;
          is_visible?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string;
          category?: string;
          xp_reward?: number;
          is_repeatable?: boolean;
          is_visible?: boolean;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          user_id: string;
          xp_total: number;
          level: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          xp_total?: number;
          level?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          xp_total?: number;
          level?: number;
          updated_at?: string;
        };
      };
      progress_events: {
        Row: {
          id: string;
          user_id: string;
          event_code: string;
          xp_delta: number;
          project_id: string | null;
          source_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_code: string;
          xp_delta?: number;
          project_id?: string | null;
          source_id?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_code?: string;
          xp_delta?: number;
          project_id?: string | null;
          source_id?: string;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          project_id: string | null;
          earned_at: string;
          meta: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          project_id?: string | null;
          earned_at?: string;
          meta?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          project_id?: string | null;
          earned_at?: string;
          meta?: Json;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          code: string;
          name: string;
          price_monthly: number;
          currency: string;
          project_limit: number;
          advanced_filters: boolean;
          priority_visibility: boolean;
          analytics_enabled: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          price_monthly?: number;
          currency?: string;
          project_limit?: number;
          advanced_filters?: boolean;
          priority_visibility?: boolean;
          analytics_enabled?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          price_monthly?: number;
          currency?: string;
          project_limit?: number;
          advanced_filters?: boolean;
          priority_visibility?: boolean;
          analytics_enabled?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          provider: string;
          provider_subscription_id: string | null;
          status: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          provider?: string;
          provider_subscription_id?: string | null;
          status?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      billing_events: {
        Row: {
          id: string;
          provider: string;
          provider_event_id: string;
          payload: Json;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider: string;
          provider_event_id: string;
          payload: Json;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider?: string;
          provider_event_id?: string;
          payload?: Json;
          processed_at?: string | null;
          created_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          is_group: boolean;
          project_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          is_group?: boolean;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_group?: boolean;
          project_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          conversation_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          conversation_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string | null;
          sender_id: string | null;
          content: string;
          is_read: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          conversation_id?: string | null;
          sender_id?: string | null;
          content: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string | null;
          sender_id?: string | null;
          content?: string;
          is_read?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      newsletter_subscriptions: {
        Row: {
          id: string;
          email: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

