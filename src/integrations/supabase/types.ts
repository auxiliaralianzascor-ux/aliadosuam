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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      allies: {
        Row: {
          category: Database["public"]["Enums"]["ally_category"] | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contacts: Json
          created_at: string
          created_by: string | null
          direction: string
          id: string
          name: string
          notes: string | null
          sector: string | null
          status: Database["public"]["Enums"]["ally_status"]
          traffic_light: Database["public"]["Enums"]["traffic_light"]
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["ally_category"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacts?: Json
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          name: string
          notes?: string | null
          sector?: string | null
          status?: Database["public"]["Enums"]["ally_status"]
          traffic_light?: Database["public"]["Enums"]["traffic_light"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["ally_category"] | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacts?: Json
          created_at?: string
          created_by?: string | null
          direction?: string
          id?: string
          name?: string
          notes?: string | null
          sector?: string | null
          status?: Database["public"]["Enums"]["ally_status"]
          traffic_light?: Database["public"]["Enums"]["traffic_light"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      ally_activities: {
        Row: {
          activity_date: string
          activity_type: string
          ally_id: string
          area: Database["public"]["Enums"]["followup_area"]
          created_at: string
          description: string
          id: string
          responsible_id: string | null
          responsible_name: string
        }
        Insert: {
          activity_date?: string
          activity_type?: string
          ally_id: string
          area?: Database["public"]["Enums"]["followup_area"]
          created_at?: string
          description: string
          id?: string
          responsible_id?: string | null
          responsible_name: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          ally_id?: string
          area?: Database["public"]["Enums"]["followup_area"]
          created_at?: string
          description?: string
          id?: string
          responsible_id?: string | null
          responsible_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "ally_activities_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "allies"
            referencedColumns: ["id"]
          },
        ]
      }
      ally_discounts: {
        Row: {
          ally_id: string
          created_at: string
          econti: string | null
          id: string
          ingles: string | null
          posgrado: string | null
          pregrado: string | null
          updated_at: string
        }
        Insert: {
          ally_id: string
          created_at?: string
          econti?: string | null
          id?: string
          ingles?: string | null
          posgrado?: string | null
          pregrado?: string | null
          updated_at?: string
        }
        Update: {
          ally_id?: string
          created_at?: string
          econti?: string | null
          id?: string
          ingles?: string | null
          posgrado?: string | null
          pregrado?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ally_discounts_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: true
            referencedRelation: "allies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_areas: {
        Row: {
          area: Database["public"]["Enums"]["followup_area"]
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          area: Database["public"]["Enums"]["followup_area"]
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          area?: Database["public"]["Enums"]["followup_area"]
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_any_role: { Args: { _user_id: string }; Returns: boolean }
      has_area: {
        Args: {
          _area: Database["public"]["Enums"]["followup_area"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ally_category: "latente" | "emergente" | "estrategico" | "activo"
      ally_status: "conversation" | "pending" | "active"
      app_role: "admin" | "member"
      followup_area:
        | "direccion"
        | "econti"
        | "mercadeo"
        | "graduados"
        | "general"
        | "proyectos"
      traffic_light: "green" | "yellow" | "red"
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
      ally_category: ["latente", "emergente", "estrategico", "activo"],
      ally_status: ["conversation", "pending", "active"],
      app_role: ["admin", "member"],
      followup_area: [
        "direccion",
        "econti",
        "mercadeo",
        "graduados",
        "general",
        "proyectos",
      ],
      traffic_light: ["green", "yellow", "red"],
    },
  },
} as const
