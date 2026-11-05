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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      absences: {
        Row: {
          absence_date: string
          created_at: string
          employee_id: string
          id: string
          proof_path: string | null
          reason: string
        }
        Insert: {
          absence_date: string
          created_at?: string
          employee_id: string
          id?: string
          proof_path?: string | null
          reason: string
        }
        Update: {
          absence_date?: string
          created_at?: string
          employee_id?: string
          id?: string
          proof_path?: string | null
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "absences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          amount: number
          created_at: string
          id: string
          level: string
          requested_by: string | null
          status: string
          title: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          level?: string
          requested_by?: string | null
          status?: string
          title: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          level?: string
          requested_by?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          category: string
          created_at: string
          id: string
          planned: number
          spent: number
          year: number
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          planned?: number
          spent?: number
          year: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          planned?: number
          spent?: number
          year?: number
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string
          debt_id: string
          id: string
          paid_at: string
          proof_path: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          debt_id: string
          id?: string
          paid_at?: string
          proof_path?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          debt_id?: string
          id?: string
          paid_at?: string
          proof_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          direction: string
          due_date: string | null
          id: string
          party: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          direction: string
          due_date?: string | null
          id?: string
          party: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          direction?: string
          due_date?: string | null
          id?: string
          party?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          base_salary: number
          created_at: string
          doc_number: string
          doc_type: string
          email: string | null
          full_name: string
          hire_date: string
          id: string
          position: string | null
          union_member: boolean
          union_pct: number
          user_id: string | null
        }
        Insert: {
          base_salary?: number
          created_at?: string
          doc_number: string
          doc_type?: string
          email?: string | null
          full_name: string
          hire_date?: string
          id?: string
          position?: string | null
          union_member?: boolean
          union_pct?: number
          user_id?: string | null
        }
        Update: {
          base_salary?: number
          created_at?: string
          doc_number?: string
          doc_type?: string
          email?: string | null
          full_name?: string
          hire_date?: string
          id?: string
          position?: string | null
          union_member?: boolean
          union_pct?: number
          user_id?: string | null
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          period: string
          score: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          period: string
          score: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          period?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          category: string
          created_at: string
          id: string
          max_discount_pct: number
          name: string
          price_retail: number
          price_wholesale: number
          unit: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          id?: string
          max_discount_pct?: number
          name: string
          price_retail?: number
          price_wholesale?: number
          unit?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          id?: string
          max_discount_pct?: number
          name?: string
          price_retail?: number
          price_wholesale?: number
          unit?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          expenses: number
          id: string
          name: string
          revenue: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          expenses?: number
          id?: string
          name: string
          revenue?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          expenses?: number
          id?: string
          name?: string
          revenue?: number
        }
        Relationships: []
      }
      resolution_votes: {
        Row: {
          created_at: string
          id: string
          resolution_id: string
          shareholder_id: string
          vote: string
        }
        Insert: {
          created_at?: string
          id?: string
          resolution_id: string
          shareholder_id: string
          vote: string
        }
        Update: {
          created_at?: string
          id?: string
          resolution_id?: string
          shareholder_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "resolution_votes_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "resolutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolution_votes_shareholder_id_fkey"
            columns: ["shareholder_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
        ]
      }
      resolutions: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          base_price: number
          created_at: string
          discount_pct: number
          exception_reason: string | null
          id: string
          mode: string
          product_id: string
          quantity: number
          seller_id: string
          total: number
          unit_price: number
        }
        Insert: {
          base_price?: number
          created_at?: string
          discount_pct?: number
          exception_reason?: string | null
          id?: string
          mode: string
          product_id: string
          quantity: number
          seller_id?: string
          total?: number
          unit_price: number
        }
        Update: {
          base_price?: number
          created_at?: string
          discount_pct?: number
          exception_reason?: string | null
          id?: string
          mode?: string
          product_id?: string
          quantity?: number
          seller_id?: string
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shareholders: {
        Row: {
          capital_pct: number
          created_at: string
          founder: boolean
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          capital_pct: number
          created_at?: string
          founder?: boolean
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          capital_pct?: number
          created_at?: string
          founder?: boolean
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assignee: string | null
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          project_id: string | null
          title: string
        }
        Insert: {
          assignee?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          project_id?: string | null
          title: string
        }
        Update: {
          assignee?: string | null
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          project_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      vacations: {
        Row: {
          created_at: string
          days: number
          employee_id: string
          id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          days: number
          employee_id: string
          id?: string
          start_date: string
        }
        Update: {
          created_at?: string
          days?: number
          employee_id?: string
          id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_sell: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gestao: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "socio_fundador"
        | "socio"
        | "gerente"
        | "diretor"
        | "funcionario"
        | "vendedor"
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
      app_role: [
        "socio_fundador",
        "socio",
        "gerente",
        "diretor",
        "funcionario",
        "vendedor",
      ],
    },
  },
} as const
