import { getSupabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface ReceivablesRecord {
  data: string;
  recebidoItauDebito: number;
  recebidoItauCredito: number;
  recebidoItauPix: number;
  depositoDinheiro: number;
  recebidoRedeDebitoBruto: number;
  recebidoRedeCreditoBruto: number;
  taxaTarifa: number;
  recebidoTotalLiquido: number;
}

export const emptyReceivablesRecord = (data: string = ''): ReceivablesRecord => ({
  data,
  recebidoItauDebito: 0,
  recebidoItauCredito: 0,
  recebidoItauPix: 0,
  depositoDinheiro: 0,
  recebidoRedeDebitoBruto: 0,
  recebidoRedeCreditoBruto: 0,
  taxaTarifa: 0,
  recebidoTotalLiquido: 0,
});

type ReceivablesRow = Tables<'receivables_data'>;

const dbToRecord = (row: ReceivablesRow): ReceivablesRecord => ({
  data: row.data,
  recebidoItauDebito: row.recebido_itau_debito || 0,
  recebidoItauCredito: row.recebido_itau_credito || 0,
  recebidoItauPix: row.recebido_itau_pix || 0,
  depositoDinheiro: row.deposito_dinheiro || 0,
  recebidoRedeDebitoBruto: row.recebido_rede_debito_bruto || 0,
  recebidoRedeCreditoBruto: row.recebido_rede_credito_bruto || 0,
  taxaTarifa: row.taxa_tarifa || 0,
  recebidoTotalLiquido: row.recebido_total_liquido || 0,
});

const recordToDb = (record: ReceivablesRecord) => ({
  data: record.data,
  recebido_itau_debito: record.recebidoItauDebito,
  recebido_itau_credito: record.recebidoItauCredito,
  recebido_itau_pix: record.recebidoItauPix,
  deposito_dinheiro: record.depositoDinheiro,
  recebido_rede_debito_bruto: record.recebidoRedeDebitoBruto,
  recebido_rede_credito_bruto: record.recebidoRedeCreditoBruto,
  taxa_tarifa: record.taxaTarifa,
  recebido_total_liquido: record.recebidoTotalLiquido,
});

export const loadAllReceivablesData = async (): Promise<Record<string, ReceivablesRecord>> => {
  const supabase = getSupabase();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('receivables_data')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao carregar recebíveis:', error);
    return {};
  }

  const result: Record<string, ReceivablesRecord> = {};
  data?.forEach((row) => {
    result[row.data] = dbToRecord(row);
  });

  return result;
};

export const loadReceivablesDataByPeriod = async (
  startDate: string,
  endDate: string
): Promise<ReceivablesRecord[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('receivables_data')
    .select('*')
    .gte('data', startDate)
    .lte('data', endDate)
    .order('data', { ascending: true });

  if (error) {
    console.error('Erro ao carregar recebíveis por período:', error);
    return [];
  }

  return (data || []).map(dbToRecord);
};

export const saveReceivablesRecord = async (
  record: ReceivablesRecord
): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado (.env).' };
  }
  const dbData = recordToDb(record);
  const { error } = await supabase
    .from('receivables_data')
    .upsert(dbData, { onConflict: 'data' });

  if (error) {
    console.error('Erro ao salvar recebíveis:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};
