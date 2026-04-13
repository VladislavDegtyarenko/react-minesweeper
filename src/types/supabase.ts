export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      best_scores: {
        Row: {
          achieved_at: string;
          best_time_ms: number;
          created_at: string;
          id: string;
          level_id: 'easy' | 'medium' | 'expert';
          updated_at: string;
          user_id: string;
        };
        Insert: {
          achieved_at?: string;
          best_time_ms: number;
          created_at?: string;
          id?: string;
          level_id: 'easy' | 'medium' | 'expert';
          updated_at?: string;
          user_id: string;
        };
        Update: {
          achieved_at?: string;
          best_time_ms?: number;
          created_at?: string;
          id?: string;
          level_id?: 'easy' | 'medium' | 'expert';
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_path: string | null;
          country: string | null;
          created_at: string;
          email: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          nickname: string;
          updated_at: string;
        };
        Insert: {
          avatar_path?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          nickname: string;
          updated_at?: string;
        };
        Update: {
          avatar_path?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          nickname?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      leaderboard_entries: {
        Row: {
          achieved_at: string;
          avatar_path: string | null;
          best_time_ms: number;
          level_id: 'easy' | 'medium' | 'expert';
          nickname: string;
          user_id: string;
        };
        Relationships: [];
      };
      public_profiles: {
        Row: {
          avatar_path: string | null;
          country: string | null;
          id: string;
          nickname: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      delete_own_account: {
        Args: Record<string, never>;
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type BestScore = Database['public']['Tables']['best_scores']['Row'];
export type LeaderboardEntry =
  Database['public']['Views']['leaderboard_entries']['Row'];
