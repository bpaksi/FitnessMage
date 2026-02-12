export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      daily_log: {
        Row: {
          calories: number
          carbs: number
          date: string
          fat: number
          food_id: string | null
          id: string
          logged_at: string | null
          meal_id: string | null
          meal_type: string
          protein: number
          servings: number
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number
          date: string
          fat?: number
          food_id?: string | null
          id?: string
          logged_at?: string | null
          meal_id?: string | null
          meal_type?: string
          protein?: number
          servings?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          date?: string
          fat?: number
          food_id?: string | null
          id?: string
          logged_at?: string | null
          meal_id?: string | null
          meal_type?: string
          protein?: number
          servings?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_log_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_log_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      device_tokens: {
        Row: {
          created_at: string | null
          device_info: Json | null
          device_name: string | null
          device_type: string | null
          expires_at: string | null
          id: string
          last_active_at: string | null
          revoked: boolean | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          device_name?: string | null
          device_type?: string | null
          expires_at?: string | null
          id?: string
          last_active_at?: string | null
          revoked?: boolean | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          device_name?: string | null
          device_type?: string | null
          expires_at?: string | null
          id?: string
          last_active_at?: string | null
          revoked?: boolean | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      food_favorites: {
        Row: {
          created_at: string | null
          food_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          food_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          food_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_favorites_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      food_serving_units: {
        Row: {
          created_at: string | null
          food_id: string
          grams: number
          id: string
          is_default: boolean | null
          label: string
        }
        Insert: {
          created_at?: string | null
          food_id: string
          grams: number
          id?: string
          is_default?: boolean | null
          label: string
        }
        Update: {
          created_at?: string | null
          food_id?: string
          grams?: number
          id?: string
          is_default?: boolean | null
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_serving_units_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          alcohol: number | null
          barcode: string | null
          brand: string | null
          caffeine: number | null
          calcium: number | null
          calories: number
          carbs: number
          category: string
          cholesterol: number | null
          choline: number | null
          contributed_at: string | null
          contribution_error: string | null
          contribution_status: string | null
          copper: number | null
          created_at: string | null
          fat: number
          fiber: number | null
          folate: number | null
          id: string
          iron: number | null
          magnesium: number | null
          manganese: number | null
          monounsaturated_fat: number | null
          name: string
          niacin: number | null
          pending_contribution: boolean | null
          phosphorus: number | null
          polyunsaturated_fat: number | null
          potassium: number | null
          protein: number
          retinol: number | null
          riboflavin: number | null
          saturated_fat: number | null
          selenium: number | null
          serving_size: string | null
          serving_size_grams: number | null
          sodium: number | null
          source: string
          sugar: number | null
          thiamin: number | null
          trans_fat: number | null
          updated_at: string | null
          user_id: string | null
          vitamin_a: number | null
          vitamin_b12: number | null
          vitamin_b6: number | null
          vitamin_c: number | null
          vitamin_d: number | null
          vitamin_e: number | null
          vitamin_k: number | null
          water_content: number | null
          zinc: number | null
        }
        Insert: {
          alcohol?: number | null
          barcode?: string | null
          brand?: string | null
          caffeine?: number | null
          calcium?: number | null
          calories?: number
          carbs?: number
          category?: string
          cholesterol?: number | null
          choline?: number | null
          contributed_at?: string | null
          contribution_error?: string | null
          contribution_status?: string | null
          copper?: number | null
          created_at?: string | null
          fat?: number
          fiber?: number | null
          folate?: number | null
          id?: string
          iron?: number | null
          magnesium?: number | null
          manganese?: number | null
          monounsaturated_fat?: number | null
          name: string
          niacin?: number | null
          pending_contribution?: boolean | null
          phosphorus?: number | null
          polyunsaturated_fat?: number | null
          potassium?: number | null
          protein?: number
          retinol?: number | null
          riboflavin?: number | null
          saturated_fat?: number | null
          selenium?: number | null
          serving_size?: string | null
          serving_size_grams?: number | null
          sodium?: number | null
          source?: string
          sugar?: number | null
          thiamin?: number | null
          trans_fat?: number | null
          updated_at?: string | null
          user_id?: string | null
          vitamin_a?: number | null
          vitamin_b12?: number | null
          vitamin_b6?: number | null
          vitamin_c?: number | null
          vitamin_d?: number | null
          vitamin_e?: number | null
          vitamin_k?: number | null
          water_content?: number | null
          zinc?: number | null
        }
        Update: {
          alcohol?: number | null
          barcode?: string | null
          brand?: string | null
          caffeine?: number | null
          calcium?: number | null
          calories?: number
          carbs?: number
          category?: string
          cholesterol?: number | null
          choline?: number | null
          contributed_at?: string | null
          contribution_error?: string | null
          contribution_status?: string | null
          copper?: number | null
          created_at?: string | null
          fat?: number
          fiber?: number | null
          folate?: number | null
          id?: string
          iron?: number | null
          magnesium?: number | null
          manganese?: number | null
          monounsaturated_fat?: number | null
          name?: string
          niacin?: number | null
          pending_contribution?: boolean | null
          phosphorus?: number | null
          polyunsaturated_fat?: number | null
          potassium?: number | null
          protein?: number
          retinol?: number | null
          riboflavin?: number | null
          saturated_fat?: number | null
          selenium?: number | null
          serving_size?: string | null
          serving_size_grams?: number | null
          sodium?: number | null
          source?: string
          sugar?: number | null
          thiamin?: number | null
          trans_fat?: number | null
          updated_at?: string | null
          user_id?: string | null
          vitamin_a?: number | null
          vitamin_b12?: number | null
          vitamin_b6?: number | null
          vitamin_c?: number | null
          vitamin_d?: number | null
          vitamin_e?: number | null
          vitamin_k?: number | null
          water_content?: number | null
          zinc?: number | null
        }
        Relationships: []
      }
      meal_foods: {
        Row: {
          created_at: string | null
          food_id: string
          id: string
          meal_id: string
          servings: number
        }
        Insert: {
          created_at?: string | null
          food_id: string
          id?: string
          meal_id: string
          servings?: number
        }
        Update: {
          created_at?: string | null
          food_id?: string
          id?: string
          meal_id?: string
          servings?: number
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string | null
          id: string
          name: string
          total_servings: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          total_servings?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          total_servings?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pairing_codes: {
        Row: {
          claimed_by: string | null
          code: string
          created_at: string | null
          device_info: Json | null
          device_name: string | null
          device_type: string | null
          expires_at: string
          id: string
          token: string
        }
        Insert: {
          claimed_by?: string | null
          code: string
          created_at?: string | null
          device_info?: Json | null
          device_name?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          token: string
        }
        Update: {
          claimed_by?: string | null
          code?: string
          created_at?: string | null
          device_info?: Json | null
          device_name?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          token?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          goals: Json
          meal_time_boundaries: Json
          units: string
          updated_at: string | null
          user_id: string
          week_start_day: string
        }
        Insert: {
          created_at?: string | null
          goals?: Json
          meal_time_boundaries?: Json
          units?: string
          updated_at?: string | null
          user_id: string
          week_start_day?: string
        }
        Update: {
          created_at?: string | null
          goals?: Json
          meal_time_boundaries?: Json
          units?: string
          updated_at?: string | null
          user_id?: string
          week_start_day?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

