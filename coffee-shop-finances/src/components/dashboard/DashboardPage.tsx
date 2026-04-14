import { useMemo, useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';
import KpiCard from './KpiCard';
import RevenueChart from './RevenueChart';
import DreTable from './DreTable';
import SalesBarChart from './SalesBarChart';
import CmvPieChart from './CmvPieChart';
import RecentActivityTable from './RecentActivityTable';
import { useDashboardData } from '@/hooks/useDashboardData';
import { formatCurrency } from '@/lib/billing';
import { EMPTY_DRE_ROWS } from '@/lib/dashboardMetrics';

const DEFAULT_PIE = [
  { name: 'Dinheiro / PIX', value: 0 },
  { name: 'Cartão (líquido)', value: 0 },
  { name: 'Demais', value: 0 },
];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'financial' | 'operational'>('financial');
  const { loading, error, metrics, reload } = useDashboardData();

  const hasBilling = metrics != null && metrics.faturamentoBruto > 0;
  const periodHint = hasBilling ? 'Últimos 30 dias' : '— sem dados';

  const financialKpis = useMemo(() => {
    const m = metrics;
    return [
      { label: 'Faturamento Bruto', value: formatCurrency(m?.faturamentoBruto ?? 0), trend: 'neutral' as const, trendLabel: periodHint },
      { label: 'Ticket Médio', value: formatCurrency(m?.ticketMedio ?? 0), trend: 'neutral' as const, trendLabel: periodHint },
      { label: 'Faturamento sem Taxa', value: formatCurrency(m?.faturamentoSemTaxa ?? 0), trend: 'neutral' as const, trendLabel: periodHint },
      { label: 'Valor Recebido na Conta', value: formatCurrency(m?.valorRecebidoConta ?? 0), trend: 'neutral' as const, trendLabel: periodHint },
    ];
  }, [metrics, periodHint]);

  const financialKpis2 = useMemo(() => {
    const m = metrics;
    return [
      { label: 'Despesas Totais', value: formatCurrency(m?.despesasTotais ?? 0), trend: 'neutral' as const, trendLabel: periodHint },
      { label: 'Custo Fixo', value: formatCurrency(m?.custoFixo ?? 0), trend: 'neutral' as const, trendLabel: '— sem cadastro' },
      { label: 'Custos Variáveis c/ Produto', value: formatCurrency(m?.custosVariaveisProduto ?? 0), trend: 'neutral' as const, trendLabel: '— sem cadastro' },
      { label: 'Custo com Taxa de Cartão', value: formatCurrency(m?.custoTaxaCartao ?? 0), trend: 'neutral' as const, trendLabel: periodHint },
    ];
  }, [metrics, periodHint]);

  const operationalKpis = useMemo(() => {
    const m = metrics;
    const q = m?.qtdeVendas ?? 0;
    return [
      { label: 'Quantidade de Vendas', value: String(q), trend: 'neutral' as const, trendLabel: periodHint },
      { label: 'Ticket Médio', value: formatCurrency(m?.ticketMedio ?? 0), trend: 'neutral' as const, trendLabel: periodHint },
    ];
  }, [metrics, periodHint]);

  const dreRows = metrics?.dreRows ?? EMPTY_DRE_ROWS;
  const revenueData = metrics?.revenueByDay ?? [];
  const salesData = metrics?.salesByWeekday ?? [];
  const pieData = metrics?.cmvPie ?? DEFAULT_PIE;
  const recentRows = metrics?.recentRows ?? [];

  return (
    <div className="min-h-full rounded-xl p-6" style={{ background: 'hsl(var(--dashboard-bg))' }}>
      {error && (
        <div className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: 'hsl(var(--dashboard-card-border))', color: 'hsl(var(--dashboard-negative))' }}>
          {error}
        </div>
      )}
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold" style={{ color: 'hsl(var(--dashboard-text))', fontFamily: "'Space Grotesk', sans-serif" }}>
            Dashboard
          </h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
            style={{ background: 'hsl(var(--dashboard-card))', borderColor: 'hsl(var(--dashboard-card-border))', color: 'hsl(var(--dashboard-text-muted))' }}>
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Último 30 dias</span>
          </div>
        </div>
        <button type="button" title="Atualizar dados" onClick={() => void reload()}
          className="p-2 rounded-lg border transition-colors hover:opacity-80"
          style={{ background: 'hsl(var(--dashboard-card))', borderColor: 'hsl(var(--dashboard-card-border))', color: 'hsl(var(--dashboard-text-muted))' }}>
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="inline-flex rounded-lg p-1 mb-8"
        style={{ background: 'hsl(var(--dashboard-card))' }}>
        {(['financial', 'operational'] as const).map(tab => (
          <button key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              background: activeTab === tab ? 'hsl(var(--dashboard-accent))' : 'transparent',
              color: activeTab === tab ? 'hsl(0, 0%, 100%)' : 'hsl(var(--dashboard-text-muted))',
            }}>
            {tab === 'financial' ? 'Financeiro' : 'Operacional'}
          </button>
        ))}
      </div>

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialKpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialKpis2.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
          </div>
          <RevenueChart data={revenueData} loading={loading} />
          <DreTable rows={dreRows} />
        </div>
      )}

      {/* Operational Tab */}
      {activeTab === 'operational' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {operationalKpis.map((kpi, i) => <KpiCard key={i} {...kpi} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesBarChart data={salesData} loading={loading} />
            <CmvPieChart data={pieData} />
          </div>
          <RecentActivityTable rows={recentRows} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
