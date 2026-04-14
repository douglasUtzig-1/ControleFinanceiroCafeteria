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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      receivables_data: {
        Row: {
          id: number
          data: string
          recebido_itau_debito: number | null
          recebido_itau_credito: number | null
          recebido_itau_pix: number | null
          deposito_dinheiro: number | null
          recebido_rede_debito_bruto: number | null
          recebido_rede_credito_bruto: number | null
          taxa_tarifa: number | null
          recebido_total_liquido: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          data: string
          recebido_itau_debito?: number | null
          recebido_itau_credito?: number | null
          recebido_itau_pix?: number | null
          deposito_dinheiro?: number | null
          recebido_rede_debito_bruto?: number | null
          recebido_rede_credito_bruto?: number | null
          taxa_tarifa?: number | null
          recebido_total_liquido?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          data?: string
          recebido_itau_debito?: number | null
          recebido_itau_credito?: number | null
          recebido_itau_pix?: number | null
          deposito_dinheiro?: number | null
          recebido_rede_debito_bruto?: number | null
          recebido_rede_credito_bruto?: number | null
          taxa_tarifa?: number | null
          recebido_total_liquido?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_data: {
        Row: {
          abertura: number | null
          created_at: string | null
          credito: number | null
          credito_bruto: number | null
          credito_liquido: number | null
          credito_pos: number | null
          total_credito_sistema_pos: number | null
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
          qr_code: number | null
          qtde_vendas: number | null
          retirada: number | null
          transferencia: number | null
          updated_at: string | null
        }
        Insert: {
          abertura?: number | null
          created_at?: string | null
          credito?: number | null
          credito_bruto?: number | null
          credito_liquido?: number | null
          credito_pos?: number | null
          total_credito_sistema_pos?: number | null
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
          qr_code?: number | null
          qtde_vendas?: number | null
          retirada?: number | null
          transferencia?: number | null
          updated_at?: string | null
        }
        Update: {
          abertura?: number | null
          created_at?: string | null
          credito?: number | null
          credito_bruto?: number | null
          credito_liquido?: number | null
          credito_pos?: number | null
          total_credito_sistema_pos?: number | null
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
          qr_code?: number | null
          qtde_vendas?: number | null
          retirada?: number | null
          transferencia?: number | null
          updated_at?: string | null
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
  public: {
    Enums: {},
  },
} as const
