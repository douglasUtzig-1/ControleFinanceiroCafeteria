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
      app_users: {
        Row: {
          ativo: boolean | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          cargo: string | null
          created_at: string | null
          email: string
          id: string
          nome: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          cargo?: string | null
          created_at?: string | null
          email: string
          id?: string
          nome?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          cargo?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      billing_audit: {
        Row: {
          action: string
          billing_data_id: number | null
          changed_at: string | null
          changed_by: string | null
          id: number
          new_values: Json | null
          old_values: Json | null
        }
        Insert: {
          action: string
          billing_data_id?: number | null
          changed_at?: string | null
          changed_by?: string | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
        }
        Update: {
          action?: string
          billing_data_id?: number | null
          changed_at?: string | null
          changed_by?: string | null
          id?: number
          new_values?: Json | null
          old_values?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_audit_billing_data_id_fkey"
            columns: ["billing_data_id"]
            isOneToOne: false
            referencedRelation: "billing_data"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_data: {
        Row: {
          abertura: number | null
          caixa_ok: number | null
          created_at: string | null
          credito: number | null
          credito_bruto: number | null
          credito_liquido: number | null
          credito_pos: number | null
          data: string
          debito: number | null
          debito_bruto: number | null
          debito_liquido: number | null
          debito_pos: number | null
          dinheiro: number | null
          fechamento: number | null
          id: number
          observacoes: string | null
          pix: number | null
          pix_ok: number | null
          pix_pos: number | null
          qr_code: number | null
          qtde_vendas: number | null
          retirada: number | null
          saldo_caixa: number | null
          ticket_medio: number | null
          total_cartao: number | null
          total_credito_sistema_pos: number
          total_pix: number | null
          total_sistema: number | null
          transferencia: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          abertura?: number | null
          caixa_ok?: number | null
          created_at?: string | null
          credito?: number | null
          credito_bruto?: number | null
          credito_liquido?: number | null
          credito_pos?: number | null
          data: string
          debito?: number | null
          debito_bruto?: number | null
          debito_liquido?: number | null
          debito_pos?: number | null
          dinheiro?: number | null
          fechamento?: number | null
          id?: number
          observacoes?: string | null
          pix?: number | null
          pix_ok?: number | null
          pix_pos?: number | null
          qr_code?: number | null
          qtde_vendas?: number | null
          retirada?: number | null
          saldo_caixa?: number | null
          ticket_medio?: number | null
          total_cartao?: number | null
          total_credito_sistema_pos?: number
          total_pix?: number | null
          total_sistema?: number | null
          transferencia?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          abertura?: number | null
          caixa_ok?: number | null
          created_at?: string | null
          credito?: number | null
          credito_bruto?: number | null
          credito_liquido?: number | null
          credito_pos?: number | null
          data?: string
          debito?: number | null
          debito_bruto?: number | null
          debito_liquido?: number | null
          debito_pos?: number | null
          dinheiro?: number | null
          fechamento?: number | null
          id?: number
          observacoes?: string | null
          pix?: number | null
          pix_ok?: number | null
          pix_pos?: number | null
          qr_code?: number | null
          qtde_vendas?: number | null
          retirada?: number | null
          saldo_caixa?: number | null
          ticket_medio?: number | null
          total_cartao?: number | null
          total_credito_sistema_pos?: number
          total_pix?: number | null
          total_sistema?: number | null
          transferencia?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      receivables_data: {
        Row: {
          created_at: string | null
          data: string
          deposito_dinheiro: number | null
          id: number
          recebido_itau_credito: number | null
          recebido_itau_debito: number | null
          recebido_itau_pix: number | null
          recebido_rede_credito_bruto: number | null
          recebido_rede_debito_bruto: number | null
          recebido_total_liquido: number | null
          taxa_tarifa: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data: string
          deposito_dinheiro?: number | null
          id?: number
          recebido_itau_credito?: number | null
          recebido_itau_debito?: number | null
          recebido_itau_pix?: number | null
          recebido_rede_credito_bruto?: number | null
          recebido_rede_debito_bruto?: number | null
          recebido_total_liquido?: number | null
          taxa_tarifa?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: string
          deposito_dinheiro?: number | null
          id?: number
          recebido_itau_credito?: number | null
          recebido_itau_debito?: number | null
          recebido_itau_pix?: number | null
          recebido_rede_credito_bruto?: number | null
          recebido_rede_debito_bruto?: number | null
          recebido_total_liquido?: number | null
          taxa_tarifa?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_monthly_summary: {
        Args: { year_month: string }
        Returns: {
          dias_com_registro: number
          media_diaria: number
          total_abertura: number
          total_fechamento: number
          total_receita: number
          total_vendas: number
        }[]
      }
      validate_billing_consistency: {
        Args: { billing_date: string }
        Returns: {
          caixa_consistente: boolean
          mensagem: string
          pix_consistente: boolean
        }[]
      }
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
  public: {
    Enums: {},
  },
} as const
