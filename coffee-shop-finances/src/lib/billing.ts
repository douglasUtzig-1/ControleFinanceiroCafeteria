import { getSupabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

export const formatCurrencyInput = (rawValue: string): string => {
  const digits = rawValue.replace(/\D/g, '');
  if (!digits) return '';
  const num = (parseInt(digits) / 100).toFixed(2);
  return num.replace('.', ',');
};

export const formatDateBR = (dateString: string): string => {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export interface BillingRecord {
  data: string;
  abertura: number;
  fechamento: number;
  qtdeVendas: number;
  dinheiro: number;
  pix: number;
  credito: number;
  debito: number;
  qrCode: number;
  /** PIX recebido via máquina/POS (banco); distinto de débito/crédito POS cartão */
  pixPos: number;
  retirada: number;
  transferencia: number;
  debitoBruto: number;
  debitoLiquido: number;
  creditoBruto: number;
  creditoLiquido: number;
  debitoPos: number;
  creditoPos: number;
  /** Persistido: Crédito (sistema) + Crédito POS */
  totalCreditoSistemaPos: number;
  observacoes: string;
}

export const emptyRecord = (data: string = ''): BillingRecord => ({
  data,
  abertura: 0,
  fechamento: 0,
  qtdeVendas: 0,
  dinheiro: 0,
  pix: 0,
  credito: 0,
  debito: 0,
  qrCode: 0,
  pixPos: 0,
  retirada: 0,
  transferencia: 0,
  debitoBruto: 0,
  debitoLiquido: 0,
  creditoBruto: 0,
  creditoLiquido: 0,
  debitoPos: 0,
  creditoPos: 0,
  totalCreditoSistemaPos: 0,
  observacoes: '',
});

// Convert DB row to app record
type BillingRow = Tables<'billing_data'>;

const dbToRecord = (row: BillingRow): BillingRecord => ({
  data: row.data,
  abertura: row.abertura || 0,
  fechamento: row.fechamento || 0,
  qtdeVendas: row.qtde_vendas || 0,
  dinheiro: row.dinheiro || 0,
  pix: row.pix || 0,
  credito: row.credito || 0,
  debito: row.debito || 0,
  qrCode: row.qr_code || 0,
  pixPos: row.pix_pos || 0,
  retirada: row.retirada || 0,
  transferencia: row.transferencia || 0,
  debitoBruto: row.debito_bruto || 0,
  debitoLiquido: row.debito_liquido || 0,
  creditoBruto: row.credito_bruto || 0,
  creditoLiquido: row.credito_liquido || 0,
  debitoPos: row.debito_pos || 0,
  creditoPos: row.credito_pos || 0,
  totalCreditoSistemaPos:
    row.total_credito_sistema_pos != null
      ? Number(row.total_credito_sistema_pos)
      : (row.credito || 0) + (row.credito_pos || 0),
  observacoes: row.observacoes || '',
});

// Convert app record to DB insert/update
const recordToDb = (record: BillingRecord) => ({
  data: record.data,
  abertura: record.abertura,
  fechamento: record.fechamento,
  qtde_vendas: record.qtdeVendas,
  dinheiro: record.dinheiro,
  pix: record.pix,
  credito: record.credito,
  debito: record.debito,
  qr_code: record.qrCode,
  pix_pos: record.pixPos,
  retirada: record.retirada,
  transferencia: record.transferencia,
  debito_bruto: record.debitoBruto,
  debito_liquido: record.debitoLiquido,
  credito_bruto: record.creditoBruto,
  credito_liquido: record.creditoLiquido,
  debito_pos: record.debitoPos,
  credito_pos: record.creditoPos,
  total_credito_sistema_pos: record.credito + record.creditoPos,
  observacoes: record.observacoes,
});

export const loadAllBillingData = async (): Promise<Record<string, BillingRecord>> => {
  const supabase = getSupabase();
  if (!supabase) return {};
  const { data, error } = await supabase
    .from('billing_data')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao carregar dados:', error);
    return {};
  }

  const result: Record<string, BillingRecord> = {};
  data?.forEach(row => {
    result[row.data] = dbToRecord(row);
  });
  return result;
};

export const loadBillingDataByPeriod = async (
  startDate: string,
  endDate: string
): Promise<BillingRecord[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('billing_data')
    .select('*')
    .gte('data', startDate)
    .lte('data', endDate)
    .order('data', { ascending: true });

  if (error) {
    console.error('Erro ao carregar dados por período:', error);
    return [];
  }

  return (data || []).map(dbToRecord);
};

export const saveBillingRecord = async (record: BillingRecord): Promise<{ success: boolean; error?: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado (.env).' };
  }
  const dbData = recordToDb(record);

  const { error } = await supabase
    .from('billing_data')
    .upsert(dbData, { onConflict: 'data' });

  if (error) {
    console.error('Erro ao salvar:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const getLatestDate = (data: Record<string, BillingRecord>): string => {
  const dates = Object.keys(data).sort((a, b) => b.localeCompare(a));
  return dates[0] || '';
};
