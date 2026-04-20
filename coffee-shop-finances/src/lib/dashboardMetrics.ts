import { eachDayOfInterval, format } from 'date-fns';
import type { BillingRecord } from '@/lib/billing';
import type { ReceivablesRecord } from '@/lib/receivables';
import { formatCurrency } from '@/lib/billing';

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

function totalSistema(r: BillingRecord): number {
  return r.dinheiro + r.pix + r.credito + r.debito;
}

function taxaCartaoDia(r: BillingRecord): number {
  const bruto = r.debitoBruto + r.creditoBruto;
  const liq = r.debitoLiquido + r.creditoLiquido;
  return Math.max(0, bruto - liq);
}

function dinheiroPix(r: BillingRecord): number {
  return r.dinheiro + r.pix + r.qrCode + r.pixPos + r.transferencia;
}

export type DreRowType = 'normal' | 'deduction' | 'subtotal' | 'total';

export type DashboardMetrics = {
  faturamentoBruto: number;
  ticketMedio: number;
  faturamentoSemTaxa: number;
  valorRecebidoConta: number;
  despesasTotais: number;
  custoFixo: number;
  custosVariaveisProduto: number;
  custoTaxaCartao: number;
  qtdeVendas: number;
  revenueByDay: { day: string; value: number }[];
  salesByWeekday: { day: string; vendas: number }[];
  cmvPie: { name: string; value: number }[];
  dreRows: { label: string; value: string; type: DreRowType }[];
  recentRows: { data: string; produto: string; valor: string; forma: string }[];
};

/** Linhas DRE quando ainda não há métricas carregadas. */
export const EMPTY_DRE_ROWS: DashboardMetrics['dreRows'] = [
  { label: 'Receita Bruta', value: formatCurrency(0), type: 'normal' },
  { label: '(-) Taxas', value: formatCurrency(0), type: 'deduction' },
  { label: '(=) Receita Líquida', value: formatCurrency(0), type: 'subtotal' },
  { label: '(-) Custos Variáveis', value: formatCurrency(0), type: 'deduction' },
  { label: '(-) Custos Fixos', value: formatCurrency(0), type: 'deduction' },
  { label: '(=) Lucro / Saldo', value: formatCurrency(0), type: 'total' },
];

function jsWeekdayToSegDom(d: Date): number {
  const g = d.getDay();
  return g === 0 ? 6 : g - 1;
}

export function computeDashboardMetrics(
  billing: BillingRecord[],
  receivables: ReceivablesRecord[],
  rangeStart: Date,
  rangeEnd: Date
): DashboardMetrics {
  const byDate = new Map(billing.map((r) => [r.data, r]));

  let sumTotalSistema = 0;
  let sumQtde = 0;
  let sumTaxaCartao = 0;
  let sumRetirada = 0;
  let sumRecebidoLiquido = 0;
  let sumTaxaTarifaRec = 0;

  const vendasPorDiaSemana = [0, 0, 0, 0, 0, 0, 0];

  for (const r of billing) {
    const ts = totalSistema(r);
    sumTotalSistema += ts;
    sumQtde += r.qtdeVendas;
    sumTaxaCartao += taxaCartaoDia(r);
    sumRetirada += r.retirada;

    const dt = new Date(r.data + 'T12:00:00');
    vendasPorDiaSemana[jsWeekdayToSegDom(dt)] += r.qtdeVendas;
  }

  for (const rec of receivables) {
    sumRecebidoLiquido += rec.recebidoTotalLiquido;
    sumTaxaTarifaRec += rec.taxaTarifa;
  }

  const ticketMedio = sumQtde > 0 ? sumTotalSistema / sumQtde : 0;
  const taxasTotais = sumTaxaCartao + sumTaxaTarifaRec;
  const faturamentoSemTaxa = sumTotalSistema - sumTaxaCartao;
  const despesasTotais = sumRetirada + sumTaxaTarifaRec;

  const revenueByDay = eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map((d) => {
    const iso = format(d, 'yyyy-MM-dd');
    const rec = byDate.get(iso);
    return {
      day: format(d, 'dd/MM'),
      value: rec ? totalSistema(rec) : 0,
    };
  });

  const salesByWeekday = WEEKDAYS.map((day, i) => ({
    day,
    vendas: vendasPorDiaSemana[i],
  }));

  let mixDinheiroPix = 0;
  let mixCartaoLiq = 0;
  for (const r of billing) {
    mixDinheiroPix += dinheiroPix(r);
    mixCartaoLiq += r.debitoLiquido + r.creditoLiquido;
  }
  const mixOutros = Math.max(0, sumTotalSistema - mixDinheiroPix - mixCartaoLiq);
  const cmvPie = [
    { name: 'Dinheiro / PIX', value: mixDinheiroPix },
    { name: 'Cartão (líquido)', value: mixCartaoLiq },
    { name: 'Demais', value: mixOutros },
  ];

  const receitaLiquida = sumTotalSistema - taxasTotais;
  const lucroAprox = receitaLiquida - sumRetirada;

  const dreRows: DashboardMetrics['dreRows'] = [
    { label: 'Receita Bruta', value: formatCurrency(sumTotalSistema), type: 'normal' },
    { label: '(-) Taxas', value: formatCurrency(taxasTotais), type: 'deduction' },
    { label: '(=) Receita Líquida', value: formatCurrency(receitaLiquida), type: 'subtotal' },
    { label: '(-) Custos Variáveis', value: formatCurrency(0), type: 'deduction' },
    { label: '(-) Custos Fixos', value: formatCurrency(0), type: 'deduction' },
    { label: '(=) Lucro / Saldo', value: formatCurrency(lucroAprox), type: 'total' },
  ];

  const recentRows = [...billing]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5)
    .map((r) => {
      const ts = totalSistema(r);
      const d = dinheiroPix(r);
      const c = r.debitoLiquido + r.creditoLiquido;
      let forma = 'Misto';
      if (ts <= 0) forma = '—';
      else if (d >= c && d >= ts - d - c) forma = 'Dinheiro / PIX';
      else if (c >= d) forma = 'Cartão';
      return {
        data: r.data,
        produto: 'Fechamento diário',
        valor: formatCurrency(ts),
        forma,
      };
    });

  return {
    faturamentoBruto: sumTotalSistema,
    ticketMedio,
    faturamentoSemTaxa,
    valorRecebidoConta: sumRecebidoLiquido,
    despesasTotais,
    custoFixo: 0,
    custosVariaveisProduto: 0,
    custoTaxaCartao: sumTaxaCartao,
    qtdeVendas: sumQtde,
    revenueByDay,
    salesByWeekday,
    cmvPie,
    dreRows,
    recentRows,
  };
}
