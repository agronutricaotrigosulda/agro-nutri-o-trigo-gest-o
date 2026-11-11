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
          decided_at: string | null
          decided_by: string | null
          decision: string
          employee_id: string
          id: string
          justification: string | null
          occurred_at: string | null
          proof_path: string | null
          reason: string
          submitted_at: string | null
        }
        Insert: {
          absence_date: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string
          employee_id: string
          id?: string
          justification?: string | null
          occurred_at?: string | null
          proof_path?: string | null
          reason: string
          submitted_at?: string | null
        }
        Update: {
          absence_date?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision?: string
          employee_id?: string
          id?: string
          justification?: string | null
          occurred_at?: string | null
          proof_path?: string | null
          reason?: string
          submitted_at?: string | null
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
          area: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          level: string
          requested_by: string | null
          status: string
          title: string
        }
        Insert: {
          amount?: number
          area?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          level?: string
          requested_by?: string | null
          status?: string
          title: string
        }
        Update: {
          amount?: number
          area?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          level?: string
          requested_by?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
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
      cash_movements: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          description: string
          direction: string
          event_key: string
          id: string
          project_id: string | null
          proof_path: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string
          description: string
          direction: string
          event_key: string
          id?: string
          project_id?: string | null
          proof_path: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          direction?: string
          event_key?: string
          id?: string
          project_id?: string | null
          proof_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      company_contacts: {
        Row: {
          contact: string | null
          email: string | null
          id: string
          name: string
          position: string
        }
        Insert: {
          contact?: string | null
          email?: string | null
          id?: string
          name: string
          position: string
        }
        Update: {
          contact?: string | null
          email?: string | null
          id?: string
          name?: string
          position?: string
        }
        Relationships: []
      }
      debt_items: {
        Row: {
          debt_id: string
          group_name: string | null
          id: string
          name: string
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          debt_id: string
          group_name?: string | null
          id?: string
          name: string
          quantity: number
          unit?: string
          unit_price: number
        }
        Update: {
          debt_id?: string
          group_name?: string | null
          id?: string
          name?: string
          quantity?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "debt_items_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
        ]
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
      employee_requests: {
        Row: {
          created_at: string
          days: number | null
          decided_at: string | null
          decided_by: string | null
          details: string
          employee_id: string
          id: string
          kind: string
          start_date: string | null
          status: string
        }
        Insert: {
          created_at?: string
          days?: number | null
          decided_at?: string | null
          decided_by?: string | null
          details: string
          employee_id: string
          id?: string
          kind: string
          start_date?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          days?: number | null
          decided_at?: string | null
          decided_by?: string | null
          details?: string
          employee_id?: string
          id?: string
          kind?: string
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          area: string | null
          base_salary: number
          birth_date: string | null
          contract_type: string
          created_at: string
          dependents: number
          doc_expires: string | null
          doc_issued: string | null
          doc_number: string
          doc_path: string | null
          doc_type: string
          drive_folder_id: string | null
          email: string | null
          full_name: string
          gender: string | null
          hire_date: string
          id: string
          position: string | null
          union_member: boolean
          union_pct: number
          user_id: string | null
        }
        Insert: {
          area?: string | null
          base_salary?: number
          birth_date?: string | null
          contract_type?: string
          created_at?: string
          dependents?: number
          doc_expires?: string | null
          doc_issued?: string | null
          doc_number: string
          doc_path?: string | null
          doc_type?: string
          drive_folder_id?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          hire_date?: string
          id?: string
          position?: string | null
          union_member?: boolean
          union_pct?: number
          user_id?: string | null
        }
        Update: {
          area?: string | null
          base_salary?: number
          birth_date?: string | null
          contract_type?: string
          created_at?: string
          dependents?: number
          doc_expires?: string | null
          doc_issued?: string | null
          doc_number?: string
          doc_path?: string | null
          doc_type?: string
          drive_folder_id?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
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
      payroll_payments: {
        Row: {
          amount: number
          event_key: string
          id: string
          paid_at: string
          paid_by: string
          proof_path: string
          reason: string | null
          run_id: string
        }
        Insert: {
          amount: number
          event_key: string
          id?: string
          paid_at?: string
          paid_by: string
          proof_path: string
          reason?: string | null
          run_id: string
        }
        Update: {
          amount?: number
          event_key?: string
          id?: string
          paid_at?: string
          paid_by?: string
          proof_path?: string
          reason?: string | null
          run_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_payments_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          absence_deduction: number
          base: number
          created_at: string
          employee_id: string
          employee_signed_at: string | null
          employee_signed_by: string | null
          hr_signed_at: string | null
          hr_signed_by: string | null
          id: string
          inss_employer: number
          inss_worker: number
          irps: number | null
          net: number | null
          period: string
          status: string
          thirteenth_pct: number
          union_deduction: number
        }
        Insert: {
          absence_deduction?: number
          base: number
          created_at?: string
          employee_id: string
          employee_signed_at?: string | null
          employee_signed_by?: string | null
          hr_signed_at?: string | null
          hr_signed_by?: string | null
          id?: string
          inss_employer: number
          inss_worker: number
          irps?: number | null
          net?: number | null
          period: string
          status?: string
          thirteenth_pct?: number
          union_deduction?: number
        }
        Update: {
          absence_deduction?: number
          base?: number
          created_at?: string
          employee_id?: string
          employee_signed_at?: string | null
          employee_signed_by?: string | null
          hr_signed_at?: string | null
          hr_signed_by?: string | null
          id?: string
          inss_employer?: number
          inss_worker?: number
          irps?: number | null
          net?: number | null
          period?: string
          status?: string
          thirteenth_pct?: number
          union_deduction?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_employee_id_fkey"
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
          area: string | null
          created_at: string
          description: string | null
          expenses: number
          id: string
          investment: number
          name: string
          revenue: number
          sheet_range: string | null
          submitted_at: string
          submitted_by: string | null
          uses_company_resources: boolean
        }
        Insert: {
          area?: string | null
          created_at?: string
          description?: string | null
          expenses?: number
          id?: string
          investment?: number
          name: string
          revenue?: number
          sheet_range?: string | null
          submitted_at?: string
          submitted_by?: string | null
          uses_company_resources?: boolean
        }
        Update: {
          area?: string | null
          created_at?: string
          description?: string | null
          expenses?: number
          id?: string
          investment?: number
          name?: string
          revenue?: number
          sheet_range?: string | null
          submitted_at?: string
          submitted_by?: string | null
          uses_company_resources?: boolean
        }
        Relationships: []
      }
      quota_operations: {
        Row: {
          actor_id: string
          amount: number
          buyer_id: string
          created_at: string
          id: string
          quota_pct: number
          seller_id: string | null
        }
        Insert: {
          actor_id: string
          amount: number
          buyer_id: string
          created_at?: string
          id?: string
          quota_pct: number
          seller_id?: string | null
        }
        Update: {
          actor_id?: string
          amount?: number
          buyer_id?: string
          created_at?: string
          id?: string
          quota_pct?: number
          seller_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quota_operations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quota_operations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "shareholders"
            referencedColumns: ["id"]
          },
        ]
      }
      reserve_operations: {
        Row: {
          actor_id: string
          amount: number
          created_at: string
          id: string
          kind: string
          proof_path: string
          reserve_id: string
        }
        Insert: {
          actor_id: string
          amount: number
          created_at?: string
          id?: string
          kind: string
          proof_path: string
          reserve_id: string
        }
        Update: {
          actor_id?: string
          amount?: number
          created_at?: string
          id?: string
          kind?: string
          proof_path?: string
          reserve_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reserve_operations_reserve_id_fkey"
            columns: ["reserve_id"]
            isOneToOne: false
            referencedRelation: "strategic_reserves"
            referencedColumns: ["id"]
          },
        ]
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
          qualified_quorum: boolean
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          qualified_quorum?: boolean
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          qualified_quorum?: boolean
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
          proof_path: string | null
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
          proof_path?: string | null
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
          proof_path?: string | null
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
      sector_plans: {
        Row: {
          area: string
          budget: number
          created_at: string
          id: string
          strategy: string | null
          title: string
        }
        Insert: {
          area: string
          budget?: number
          created_at?: string
          id?: string
          strategy?: string | null
          title: string
        }
        Update: {
          area?: string
          budget?: number
          created_at?: string
          id?: string
          strategy?: string | null
          title?: string
        }
        Relationships: []
      }
      shareholders: {
        Row: {
          capital_pct: number
          contact: string | null
          created_at: string
          doc_number: string | null
          email: string | null
          founder: boolean
          id: string
          invested: number
          name: string
          user_id: string | null
        }
        Insert: {
          capital_pct: number
          contact?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          founder?: boolean
          id?: string
          invested?: number
          name: string
          user_id?: string | null
        }
        Update: {
          capital_pct?: number
          contact?: string | null
          created_at?: string
          doc_number?: string | null
          email?: string | null
          founder?: boolean
          id?: string
          invested?: number
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      strategic_reserves: {
        Row: {
          balance: number
          confidential: boolean
          hidden: boolean
          id: string
          kind: string
          name: string
          target: number
        }
        Insert: {
          balance?: number
          confidential?: boolean
          hidden?: boolean
          id?: string
          kind: string
          name: string
          target?: number
        }
        Update: {
          balance?: number
          confidential?: boolean
          hidden?: boolean
          id?: string
          kind?: string
          name?: string
          target?: number
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          area: string
          created_at: string
          created_by: string
          details: string | null
          id: string
          status: string
          title: string
        }
        Insert: {
          area: string
          created_at?: string
          created_by?: string
          details?: string | null
          id?: string
          status?: string
          title: string
        }
        Update: {
          area?: string
          created_at?: string
          created_by?: string
          details?: string | null
          id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          area: string | null
          assigned_user_id: string | null
          assignee: string | null
          created_at: string
          created_by: string | null
          done: boolean
          due_date: string | null
          id: string
          postponed_reason: string | null
          project_id: string | null
          scope: string
          title: string
        }
        Insert: {
          area?: string | null
          assigned_user_id?: string | null
          assignee?: string | null
          created_at?: string
          created_by?: string | null
          done?: boolean
          due_date?: string | null
          id?: string
          postponed_reason?: string | null
          project_id?: string | null
          scope?: string
          title: string
        }
        Update: {
          area?: string | null
          assigned_user_id?: string | null
          assignee?: string | null
          created_at?: string
          created_by?: string | null
          done?: boolean
          due_date?: string | null
          id?: string
          postponed_reason?: string | null
          project_id?: string | null
          scope?: string
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
      user_access: {
        Row: {
          access_level: string
          area: string | null
          position: string | null
          sales_enabled: boolean
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_level?: string
          area?: string | null
          position?: string | null
          sales_enabled?: boolean
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_level?: string
          area?: string | null
          position?: string | null
          sales_enabled?: boolean
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      workspace_config: {
        Row: {
          id: number
          last_synced_at: string | null
          root_folder_id: string | null
          spreadsheet_id: string | null
        }
        Insert: {
          id?: number
          last_synced_at?: string | null
          root_folder_id?: string | null
          spreadsheet_id?: string | null
        }
        Update: {
          id?: number
          last_synced_at?: string | null
          root_folder_id?: string | null
          spreadsheet_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      access_level_for: { Args: { _id: string }; Returns: string }
      add_shareholder: {
        Args: {
          _amount: number
          _contact: string
          _doc: string
          _email: string
          _name: string
          _quota: number
          _seller: string
        }
        Returns: string
      }
      area_access: { Args: { _area: string; _id: string }; Returns: boolean }
      can_sell: { Args: { _user_id: string }; Returns: boolean }
      cast_resolution_vote: {
        Args: { _id: string; _vote: string }
        Returns: undefined
      }
      complete_task: {
        Args: { _done: boolean; _id: string }
        Returns: undefined
      }
      decide_absence: {
        Args: { _absence: string; _decision: string }
        Returns: undefined
      }
      decide_approval: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      decide_employee_request: {
        Args: { _id: string; _status: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_gestao: { Args: { _user_id: string }; Returns: boolean }
      is_partner: { Args: { _id: string }; Returns: boolean }
      move_reserve: {
        Args: { _amount: number; _id: string; _kind: string; _proof: string }
        Returns: undefined
      }
      pay_payroll: {
        Args: {
          _amount: number
          _event: string
          _id: string
          _proof: string
          _reason: string
        }
        Returns: undefined
      }
      prepare_payroll: { Args: { _period: string }; Returns: undefined }
      set_access: {
        Args: {
          _area: string
          _level: string
          _position: string
          _reason: string
          _sales: boolean
          _status: string
          _user: string
        }
        Returns: undefined
      }
      sign_payroll_employee: { Args: { _id: string }; Returns: undefined }
      sign_payroll_hr: { Args: { _id: string }; Returns: undefined }
      submit_absence_proof: {
        Args: { _absence: string; _proof: string; _reason: string }
        Returns: undefined
      }
      sync_project_totals: { Args: { _updates: Json }; Returns: undefined }
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
