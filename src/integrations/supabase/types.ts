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
      compliance_frameworks: {
        Row: {
          enabled_at: string
          framework: Database["public"]["Enums"]["framework_type"]
          id: string
          is_primary: boolean | null
          organization_id: string
        }
        Insert: {
          enabled_at?: string
          framework: Database["public"]["Enums"]["framework_type"]
          id?: string
          is_primary?: boolean | null
          organization_id: string
        }
        Update: {
          enabled_at?: string
          framework?: Database["public"]["Enums"]["framework_type"]
          id?: string
          is_primary?: boolean | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_frameworks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      control_test_results: {
        Row: {
          evidence: Json | null
          failure_reason: string | null
          id: string
          organization_control_id: string
          remediation_recommendation: string | null
          status: Database["public"]["Enums"]["control_status"]
          tested_at: string
        }
        Insert: {
          evidence?: Json | null
          failure_reason?: string | null
          id?: string
          organization_control_id: string
          remediation_recommendation?: string | null
          status: Database["public"]["Enums"]["control_status"]
          tested_at?: string
        }
        Update: {
          evidence?: Json | null
          failure_reason?: string | null
          id?: string
          organization_control_id?: string
          remediation_recommendation?: string | null
          status?: Database["public"]["Enums"]["control_status"]
          tested_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "control_test_results_organization_control_id_fkey"
            columns: ["organization_control_id"]
            isOneToOne: false
            referencedRelation: "organization_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      controls: {
        Row: {
          category: string
          control_id: string
          created_at: string
          description: string | null
          framework: Database["public"]["Enums"]["framework_type"]
          id: string
          name: string
          severity: Database["public"]["Enums"]["risk_level"]
          test_frequency_minutes: number
        }
        Insert: {
          category: string
          control_id: string
          created_at?: string
          description?: string | null
          framework: Database["public"]["Enums"]["framework_type"]
          id?: string
          name: string
          severity?: Database["public"]["Enums"]["risk_level"]
          test_frequency_minutes?: number
        }
        Update: {
          category?: string
          control_id?: string
          created_at?: string
          description?: string | null
          framework?: Database["public"]["Enums"]["framework_type"]
          id?: string
          name?: string
          severity?: Database["public"]["Enums"]["risk_level"]
          test_frequency_minutes?: number
        }
        Relationships: []
      }
      evidence_sources: {
        Row: {
          connection_config: Json
          created_at: string
          id: string
          is_active: boolean | null
          last_collection_at: string | null
          name: string
          organization_id: string
          source_type: string
        }
        Insert: {
          connection_config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_collection_at?: string | null
          name: string
          organization_id: string
          source_type: string
        }
        Update: {
          connection_config?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_collection_at?: string | null
          name?: string
          organization_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      maturity_assessments: {
        Row: {
          assessed_at: string
          domain_scores: Json
          id: string
          improvement_recommendations: Json | null
          organization_id: string
          overall_level: Database["public"]["Enums"]["maturity_level"]
          projected_risk_reduction: number | null
        }
        Insert: {
          assessed_at?: string
          domain_scores?: Json
          id?: string
          improvement_recommendations?: Json | null
          organization_id: string
          overall_level: Database["public"]["Enums"]["maturity_level"]
          projected_risk_reduction?: number | null
        }
        Update: {
          assessed_at?: string
          domain_scores?: Json
          id?: string
          improvement_recommendations?: Json | null
          organization_id?: string
          overall_level?: Database["public"]["Enums"]["maturity_level"]
          projected_risk_reduction?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "maturity_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_controls: {
        Row: {
          control_id: string
          created_at: string
          current_status: Database["public"]["Enums"]["control_status"]
          id: string
          is_enabled: boolean | null
          last_tested_at: string | null
          organization_id: string
          pass_rate: number | null
          risk_weight: number | null
          updated_at: string
        }
        Insert: {
          control_id: string
          created_at?: string
          current_status?: Database["public"]["Enums"]["control_status"]
          id?: string
          is_enabled?: boolean | null
          last_tested_at?: string | null
          organization_id: string
          pass_rate?: number | null
          risk_weight?: number | null
          updated_at?: string
        }
        Update: {
          control_id?: string
          created_at?: string
          current_status?: Database["public"]["Enums"]["control_status"]
          id?: string
          is_enabled?: boolean | null
          last_tested_at?: string | null
          organization_id?: string
          pass_rate?: number | null
          risk_weight?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_controls_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_controls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          baseline_risk_exposure: number | null
          created_at: string
          current_maturity_level: Database["public"]["Enums"]["maturity_level"]
          current_risk_exposure: number | null
          id: string
          industry: string
          name: string
          size: string
          updated_at: string
        }
        Insert: {
          baseline_risk_exposure?: number | null
          created_at?: string
          current_maturity_level?: Database["public"]["Enums"]["maturity_level"]
          current_risk_exposure?: number | null
          id?: string
          industry: string
          name: string
          size: string
          updated_at?: string
        }
        Update: {
          baseline_risk_exposure?: number | null
          created_at?: string
          current_maturity_level?: Database["public"]["Enums"]["maturity_level"]
          current_risk_exposure?: number | null
          id?: string
          industry?: string
          name?: string
          size?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_calculations: {
        Row: {
          calculated_at: string
          calculation_details: Json | null
          compliance_score: number
          control_pass_rate: number
          id: string
          maturity_level: Database["public"]["Enums"]["maturity_level"]
          organization_id: string
          projected_risk_exposure: number | null
          total_risk_exposure: number
        }
        Insert: {
          calculated_at?: string
          calculation_details?: Json | null
          compliance_score: number
          control_pass_rate: number
          id?: string
          maturity_level: Database["public"]["Enums"]["maturity_level"]
          organization_id: string
          projected_risk_exposure?: number | null
          total_risk_exposure: number
        }
        Update: {
          calculated_at?: string
          calculation_details?: Json | null
          compliance_score?: number
          control_pass_rate?: number
          id?: string
          maturity_level?: Database["public"]["Enums"]["maturity_level"]
          organization_id?: string
          projected_risk_exposure?: number | null
          total_risk_exposure?: number
        }
        Relationships: [
          {
            foreignKeyName: "risk_calculations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_scenarios: {
        Row: {
          annual_loss_exposure: number | null
          asset_at_risk: string
          created_at: string
          description: string | null
          id: string
          loss_event_frequency: number | null
          mitigating_control_ids: string[] | null
          name: string
          organization_id: string
          primary_loss_magnitude: number
          risk_level: Database["public"]["Enums"]["risk_level"]
          secondary_loss_magnitude: number
          threat_event_frequency: number
          threat_type: string
          updated_at: string
          vulnerability_factor: number
        }
        Insert: {
          annual_loss_exposure?: number | null
          asset_at_risk: string
          created_at?: string
          description?: string | null
          id?: string
          loss_event_frequency?: number | null
          mitigating_control_ids?: string[] | null
          name: string
          organization_id: string
          primary_loss_magnitude?: number
          risk_level?: Database["public"]["Enums"]["risk_level"]
          secondary_loss_magnitude?: number
          threat_event_frequency?: number
          threat_type: string
          updated_at?: string
          vulnerability_factor?: number
        }
        Update: {
          annual_loss_exposure?: number | null
          asset_at_risk?: string
          created_at?: string
          description?: string | null
          id?: string
          loss_event_frequency?: number | null
          mitigating_control_ids?: string[] | null
          name?: string
          organization_id?: string
          primary_loss_magnitude?: number
          risk_level?: Database["public"]["Enums"]["risk_level"]
          secondary_loss_magnitude?: number
          threat_event_frequency?: number
          threat_type?: string
          updated_at?: string
          vulnerability_factor?: number
        }
        Relationships: [
          {
            foreignKeyName: "threat_scenarios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "researcher" | "participant"
      control_status: "pass" | "fail" | "warning" | "not_tested"
      framework_type:
        | "nist_csf"
        | "iso_27001"
        | "soc2"
        | "cis"
        | "cobit"
        | "hipaa"
        | "pci_dss"
      maturity_level: "level_1" | "level_2" | "level_3" | "level_4" | "level_5"
      risk_level: "critical" | "high" | "medium" | "low"
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
      app_role: ["admin", "researcher", "participant"],
      control_status: ["pass", "fail", "warning", "not_tested"],
      framework_type: [
        "nist_csf",
        "iso_27001",
        "soc2",
        "cis",
        "cobit",
        "hipaa",
        "pci_dss",
      ],
      maturity_level: ["level_1", "level_2", "level_3", "level_4", "level_5"],
      risk_level: ["critical", "high", "medium", "low"],
    },
  },
} as const
