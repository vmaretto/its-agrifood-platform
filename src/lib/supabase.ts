import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface DbUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin' | 'teacher';
  avatar_url?: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeam {
  id: string;
  name: string;
  color: string;
  points: number;
  created_at: string;
}

export interface DbModule {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  icon?: string;
  slides: unknown; // JSONB
  is_published: boolean;
  is_static: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DbUserProgress {
  id: string;
  user_id: string;
  module_id: string;
  current_slide: number;
  completed_slides: number[];
  quiz_scores: Record<string, number>;
  completed: boolean;
  completed_at?: string;
  updated_at: string;
}

export interface DbBadge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  points: number;
  criteria?: unknown;
}

export interface DbUserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
}
