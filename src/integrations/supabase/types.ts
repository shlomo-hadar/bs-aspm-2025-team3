export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          category: string
          created_at: string
          default_sets: number
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          default_sets?: number
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          default_sets?: number
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          actual_weight: number
          created_at: string
          date_completed: string
          exercise_id: string
          id: string
          rating: number | null
          trainee_id: string
        }
        Insert: {
          actual_weight?: number
          created_at?: string
          date_completed?: string
          exercise_id: string
          id?: string
          rating?: number | null
          trainee_id: string
        }
        Update: {
          actual_weight?: number
          created_at?: string
          date_completed?: string
          exercise_id?: string
          id?: string
          rating?: number | null
          trainee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_logs_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trainer_trainee_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          trainee_id: string
          trainer_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          trainee_id: string
          trainer_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          trainee_id?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainer_trainee_assignments_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainer_trainee_assignments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          assigned_reps: number
          assigned_sets: number
          assigned_weight: number
          created_at: string
          exercise_id: string
          id: string
          status: Database["public"]["Enums"]["workout_status"]
          trainee_id: string
          updated_at: string
        }
        Insert: {
          assigned_reps?: number
          assigned_sets?: number
          assigned_weight?: number
          created_at?: string
          exercise_id: string
          id?: string
          status?: Database["public"]["Enums"]["workout_status"]
          trainee_id: string
          updated_at?: string
        }
        Update: {
          assigned_reps?: number
          assigned_sets?: number
          assigned_weight?: number
          created_at?: string
          exercise_id?: string
          id?: string
          status?: Database["public"]["Enums"]["workout_status"]
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_timers: {
        Row: {
          break_reason: string | null
          created_at: string
          id: string
          paused_at: string | null
          started_at: string
          status: string
          total_paused_seconds: number | null
          trainee_id: string
          updated_at: string
        }
        Insert: {
          break_reason?: string | null
          created_at?: string
          id?: string
          paused_at?: string | null
          started_at?: string
          status?: string
          total_paused_seconds?: number | null
          trainee_id: string
          updated_at?: string
        }
        Update: {
          break_reason?: string | null
          created_at?: string
          id?: string
          paused_at?: string | null
          started_at?: string
          status?: string
          total_paused_seconds?: number | null
          trainee_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_timers_trainee_id_fkey"
            columns: ["trainee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_trainer_trainee_count: {
        Args: { _trainer_id: string }
        Returns: number
      }
      get_trainers_with_availability: {
        Args: never
        Returns: {
          email: string
          id: string
          is_available: boolean
          name: string
          trainee_count: number
        }[]
      }
      is_trainee: { Args: { _user_id: string }; Returns: boolean }
      is_trainer: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      user_role: "trainer" | "trainee"
      workout_status: "pending" | "done"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["trainer", "trainee"],
      workout_status: ["pending", "done"],
    },
  },
} as const
