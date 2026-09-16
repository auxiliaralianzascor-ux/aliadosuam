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
          academic_participation: Json | null
          agreement_type: string | null
          annual_revenue: number
          applies_to: string | null
          c1_economic: number | null
          c2_services: number | null
          c3_age: boolean
          c3_compliance: boolean
          c3_events: boolean
          c3_trust: number | null
          c4_cocreated_impact: number | null
          c4_impact: boolean
          c4_rd_product: boolean
          c4_students: boolean
          c5_coherence: number | null
          c5_ethical_compliance: boolean
          c5_research_affinity: boolean
          c5_strategic_plan: boolean
          category: Database["public"]["Enums"]["ally_category"] | null
          close_date: string | null
          conditions: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contacts: Json
          created_at: string
          created_by: string | null
          decanatura: string | null
          dependency_implementer: string | null
          dependency_origin: string | null
          direction: string
          economic_value: string | null
          id: string
          ivc_total: number | null
          management_recommendation: string | null
          mission_areas: number
          mission_function: string | null
          name: string
          nit: string | null
          notes: string | null
          orchid_type: string | null
          origin: string | null
          partner_type: string | null
          sector: string | null
          shared_value: string | null
          shared_with_directions: string[] | null
          status: Database["public"]["Enums"]["ally_status"]
          traffic_light: Database["public"]["Enums"]["traffic_light"]
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          academic_participation?: Json | null
          agreement_type?: string | null
          annual_revenue?: number
          applies_to?: string | null
          c1_economic?: number | null
          c2_services?: number | null
          c3_age?: boolean
          c3_compliance?: boolean
          c3_events?: boolean
          c3_trust?: number | null
          c4_cocreated_impact?: number | null
          c4_impact?: boolean
          c4_rd_product?: boolean
          c4_students?: boolean
          c5_coherence?: number | null
          c5_ethical_compliance?: boolean
          c5_research_affinity?: boolean
          c5_strategic_plan?: boolean
          category?: Database["public"]["Enums"]["ally_category"] | null
          close_date?: string | null
          conditions?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacts?: Json
          created_at?: string
          created_by?: string | null
          decanatura?: string | null
          dependency_implementer?: string | null
          dependency_origin?: string | null
          direction?: string
          economic_value?: string | null
          id?: string
          ivc_total?: number | null
          management_recommendation?: string | null
          mission_areas?: number
          mission_function?: string | null
          name: string
          nit?: string | null
          notes?: string | null
          orchid_type?: string | null
          origin?: string | null
          partner_type?: string | null
          sector?: string | null
          shared_value?: string | null
          shared_with_directions?: string[] | null
          status?: Database["public"]["Enums"]["ally_status"]
          traffic_light?: Database["public"]["Enums"]["traffic_light"]
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          academic_participation?: Json | null
          agreement_type?: string | null
          annual_revenue?: number
          applies_to?: string | null
          c1_economic?: number | null
          c2_services?: number | null
          c3_age?: boolean
          c3_compliance?: boolean
          c3_events?: boolean
          c3_trust?: number | null
          c4_cocreated_impact?: number | null
          c4_impact?: boolean
          c4_rd_product?: boolean
          c4_students?: boolean
          c5_coherence?: number | null
          c5_ethical_compliance?: boolean
          c5_research_affinity?: boolean
          c5_strategic_plan?: boolean
          category?: Database["public"]["Enums"]["ally_category"] | null
          close_date?: string | null
          conditions?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contacts?: Json
          created_at?: string
          created_by?: string | null
          decanatura?: string | null
          dependency_implementer?: string | null
          dependency_origin?: string | null
          direction?: string
          economic_value?: string | null
          id?: string
          ivc_total?: number | null
          management_recommendation?: string | null
          mission_areas?: number
          mission_function?: string | null
          name?: string
          nit?: string | null
          notes?: string | null
          orchid_type?: string | null
          origin?: string | null
          partner_type?: string | null
          sector?: string | null
          shared_value?: string | null
          shared_with_directions?: string[] | null
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
          {
            foreignKeyName: "ally_activities_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "v_practicas_por_aliado"
            referencedColumns: ["ally_id"]
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
          {
            foreignKeyName: "ally_discounts_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: true
            referencedRelation: "v_practicas_por_aliado"
            referencedColumns: ["ally_id"]
          },
        ]
      }
      ally_indicator_contributions: {
        Row: {
          ally_id: string
          created_at: string
          created_by: string | null
          id: string
          indicator_key: string
          notes: string | null
          period_year: number
          proyecto_estrategico: string | null
          updated_at: string
          value: number
        }
        Insert: {
          ally_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          indicator_key: string
          notes?: string | null
          period_year: number
          proyecto_estrategico?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          ally_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          indicator_key?: string
          notes?: string | null
          period_year?: number
          proyecto_estrategico?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "ally_indicator_contributions_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "allies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ally_indicator_contributions_ally_id_fkey"
            columns: ["ally_id"]
            isOneToOne: false
            referencedRelation: "v_practicas_por_aliado"
            referencedColumns: ["ally_id"]
          },
          {
            foreignKeyName: "ally_indicator_contributions_indicator_key_fkey"
            columns: ["indicator_key"]
            isOneToOne: false
            referencedRelation: "strategic_indicators"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "ally_indicator_contributions_indicator_key_fkey"
            columns: ["indicator_key"]
            isOneToOne: false
            referencedRelation: "v_indicator_progress"
            referencedColumns: ["indicator_key"]
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
      strategic_indicator_yearly_targets: {
        Row: {
          id: string
          indicator_key: string
          target_value: number
          year: number
        }
        Insert: {
          id?: string
          indicator_key: string
          target_value: number
          year: number
        }
        Update: {
          id?: string
          indicator_key?: string
          target_value?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "strategic_indicator_yearly_targets_indicator_key_fkey"
            columns: ["indicator_key"]
            isOneToOne: false
            referencedRelation: "strategic_indicators"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "strategic_indicator_yearly_targets_indicator_key_fkey"
            columns: ["indicator_key"]
            isOneToOne: false
            referencedRelation: "v_indicator_progress"
            referencedColumns: ["indicator_key"]
          },
        ]
      }
      strategic_indicators: {
        Row: {
          direction_hint: string | null
          key: string
          label: string
          meta_2030: number | null
          meta_2030_nota: string | null
          objetivo: string
          programa: string
          unit: string
        }
        Insert: {
          direction_hint?: string | null
          key: string
          label: string
          meta_2030?: number | null
          meta_2030_nota?: string | null
          objetivo: string
          programa: string
          unit: string
        }
        Update: {
          direction_hint?: string | null
          key?: string
          label?: string
          meta_2030?: number | null
          meta_2030_nota?: string | null
          objetivo?: string
          programa?: string
          unit?: string
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
      user_directions: {
        Row: {
          created_at: string
          direction: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_indicator_profiles: {
        Row: {
          created_at: string
          direction: string
          profile: string
          user_id: string
        }
        Insert: {
          created_at?: string
          direction: string
          profile: string
          user_id: string
        }
        Update: {
          created_at?: string
          direction?: string
          profile?: string
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
      v_indicator_progress: {
        Row: {
          actual_value: number | null
          direction_hint: string | null
          indicator_key: string | null
          label: string | null
          objetivo: string | null
          programa: string | null
          target_value: number | null
          year: number | null
        }
        Relationships: []
      }
      v_practicas_por_aliado: {
        Row: {
          ally_id: string | null
          ally_name: string | null
          direction: string | null
          estudiantes: number | null
          status: Database["public"]["Enums"]["ally_status"] | null
          year: number | null
        }
        Relationships: []
      }
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
      has_direction: {
        Args: { _direction: string; _user_id: string }
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
        | "investigacion"
        | "innovacion"
        | "emprendimiento"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
        "investigacion",
        "innovacion",
        "emprendimiento",
      ],
      traffic_light: ["green", "yellow", "red"],
    },
  },
} as const
