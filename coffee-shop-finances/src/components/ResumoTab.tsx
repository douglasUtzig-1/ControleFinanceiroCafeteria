import { useCallback, useEffect, useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { pt } from 'date-fns/locale';
import { CalendarIcon, BarChart3, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  formatCurrency,
  formatDateBR,
  loadBillingDataByPeriod,
  type BillingRecord,
} from '@/lib/billing';
import { computeLancamentosOkValues, validationValueClass } from '@/lib/billingValidation';
import {
  computeRecebiveisOk,
  emptyReceivablesRecord,
  loadReceivablesDataByPeriod,
  type ReceivablesRecord,
} from '@/lib/receivables';

const COLUMNS = [
  'Data',
  'Caixa OK?',
  'PIX OK?',
  'Crédito OK?',
  'Débito OK?',
  'Recebiveis OK?',
  'Saldo Caixa',
  'Total Sistema',
  'Ticket Médio',
  'Total Crédito (Sistema + POS)',
  'Total PIX',
  'Total Cartão Bruto',
  'Total Cartão Líquido',
  'Total Crédito (TEF + POS)',
  'Total Débito (TEF + POS)',
];

type SummaryRow = {
  data: string;
  caixaOk: number;
  pixOk: number;
  creditoOk: number;
  debitoOk: number;
  recebiveisOk: number;
  saldoCaixa: number;
  totalSistema: number;
  ticketMedio: number;
  totalCreditoSistemaPos: number;
  totalPix: number;
  totalCartaoBruto: number;
  totalCartaoLiquido: number;
  totalCreditoTefPos: number;
  totalDebitoTefPos: number;
};

const ResumoTab = () => {
  const [startDate, setStartDate] = useState(() => startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(() => endOfMonth(new Date()));
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);

  const toIsoDate = useCallback((date: Date) => format(date, 'yyyy-MM-dd'), []);

  const mapRecordToSummary = useCallback(
    (record: BillingRecord, recebiveisByDate: Map<string, ReceivablesRecord>): SummaryRow => {
    const saldoCaixa = record.fechamento - record.abertura;
    const totalSistema = record.dinheiro + record.pix + record.credito + record.debito;
    const ticketMedio = record.qtdeVendas > 0 ? totalSistema / record.qtdeVendas : 0;
    const totalCreditoSistemaPos = record.totalCreditoSistemaPos;
    const totalPix = record.qrCode + record.pixPos + record.transferencia;
    const totalCartaoBruto = record.debitoBruto + record.creditoBruto;
    const totalCartaoLiquido = record.debitoLiquido + record.creditoLiquido;
    const totalCreditoTefPos = record.creditoBruto + record.creditoPos;
    const totalDebitoTefPos = record.debitoBruto + record.debitoPos;

    const { caixaOk, pixOk, creditoOk, debitoOk } = computeLancamentosOkValues(record);
    const recRow = recebiveisByDate.get(record.data) ?? emptyReceivablesRecord(record.data);
    const recebiveisOk = computeRecebiveisOk(recRow);

    return {
      data: record.data,
      caixaOk,
      pixOk,
      creditoOk,
      debitoOk,
      recebiveisOk,
      saldoCaixa,
      totalSistema,
      ticketMedio,
      totalCreditoSistemaPos,
      totalPix,
      totalCartaoBruto,
      totalCartaoLiquido,
      totalCreditoTefPos,
      totalDebitoTefPos,
    };
  }, []);

  const emptyMessage = useMemo(() => {
    if (!hasSearched) {
      return (
        <>
          O resumo sera exibido aqui apos existirem registros salvos em{' '}
          <span className="font-medium text-foreground">Lançamentos</span> e{' '}
          <span className="font-medium text-foreground">Recebíveis</span>{' '}
          para o período selecionado.
        </>
      );
    }

    if (queryError) return queryError;
    if (isLoading) return 'Consultando dados do período selecionado...';
    return 'Nenhum registro encontrado para o período selecionado.';
  }, [hasSearched, isLoading, queryError]);

  const fetchSummary = useCallback(
    async (from: Date, to: Date) => {
      setHasSearched(true);
      setQueryError(null);

      if (from > to) {
        toast.error('A Data Início não pode ser maior que a Data Fim.');
        setRows([]);
        return;
      }

      const start = toIsoDate(from);
      const end = toIsoDate(to);

      setIsLoading(true);
      try {
        const [billingRows, receivablesRows] = await Promise.all([
          loadBillingDataByPeriod(start, end),
          loadReceivablesDataByPeriod(start, end),
        ]);
        const recebiveisByDate = new Map(receivablesRows.map((r) => [r.data, r]));
        setRows(billingRows.map((r) => mapRecordToSummary(r, recebiveisByDate)));
      } catch (error) {
        console.error('Erro ao consultar resumo por período:', error);
        setRows([]);
        setQueryError('Ocorreu um erro ao consultar os dados. Tente novamente.');
        toast.error('Erro ao consultar dados do resumo.');
      } finally {
        setIsLoading(false);
      }
    },
    [mapRecordToSummary, toIsoDate]
  );

  useEffect(() => {
    const now = new Date();
    void fetchSummary(startOfMonth(now), endOfMonth(now));
  }, [fetchSummary]);

  const handleConsult = useCallback(async () => {
    if (!startDate || !endDate) {
      setHasSearched(true);
      setQueryError(null);
      toast.error('Selecione Data Início e Data Fim para consultar.');
      setRows([]);
      return;
    }

    await fetchSummary(startDate, endDate);
  }, [endDate, fetchSummary, startDate]);

  return (
    <div className="space-y-5">
      {/* Period Filter */}
      <div className="billing-section">
        <div className="billing-section-header">
          <div className="billing-section-icon">
            <Search className="w-4 h-4" />
          </div>
          <h3 className="billing-section-title">Filtro por Período</h3>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          {/* Start Date */}
          <div className="billing-input-group mb-0">
            <label>Data Início</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[180px] justify-start text-left font-normal h-[42px]',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate
                    ? format(startDate, 'dd/MM/yyyy', { locale: pt })
                    : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="billing-input-group mb-0">
            <label>Data Fim</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[180px] justify-start text-left font-normal h-[42px]',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate
                    ? format(endDate, 'dd/MM/yyyy', { locale: pt })
                    : 'Selecionar'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            className="h-[42px] text-primary-foreground"
            style={{ background: 'var(--gradient-primary)' }}
            onClick={handleConsult}
            disabled={isLoading}
          >
            <Search className="w-4 h-4 mr-2" />
            {isLoading ? 'Consultando...' : 'Consultar'}
          </Button>
        </div>
      </div>

      {/* Summary Table */}
      <div className="billing-section">
        <div className="billing-section-header">
          <div className="billing-section-icon">
            <BarChart3 className="w-4 h-4" />
          </div>
          <h3 className="billing-section-title">Resumo Diário</h3>
        </div>

        <div className="relative w-full overflow-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {COLUMNS.map((col) => (
                  <TableHead
                    key={col}
                    className={cn(
                      'text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap',
                      col !== 'Data' && 'text-right'
                    )}
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? rows.map((row) => (
                <TableRow key={row.data} className="hover:bg-muted/20">
                  <TableCell className="whitespace-nowrap">{formatDateBR(row.data)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <span className={cn('font-semibold tabular-nums', validationValueClass(row.caixaOk))}>
                      {formatCurrency(row.caixaOk)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <span className={cn('font-semibold tabular-nums', validationValueClass(row.pixOk))}>
                      {formatCurrency(row.pixOk)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <span className={cn('font-semibold tabular-nums', validationValueClass(row.creditoOk))}>
                      {formatCurrency(row.creditoOk)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <span className={cn('font-semibold tabular-nums', validationValueClass(row.debitoOk))}>
                      {formatCurrency(row.debitoOk)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    <span className={cn('font-semibold tabular-nums', validationValueClass(row.recebiveisOk))}>
                      {formatCurrency(row.recebiveisOk)}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.saldoCaixa)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.totalSistema)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.ticketMedio)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.totalCreditoSistemaPos)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.totalPix)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.totalCartaoBruto)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.totalCartaoLiquido)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.totalCreditoTefPos)}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">{formatCurrency(row.totalDebitoTefPos)}</TableCell>
                </TableRow>
              )) : (
                <TableRow className="hover:bg-muted/20">
                  <TableCell colSpan={COLUMNS.length} className="text-center text-sm text-muted-foreground py-6">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ResumoTab;
