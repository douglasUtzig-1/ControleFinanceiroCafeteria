import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Point = { day: string; value: number };

type RevenueChartProps = {
  data: Point[];
  loading?: boolean;
};

const RevenueChart = ({ data, loading }: RevenueChartProps) => {
  const chartData = data.length > 0 ? data : [{ day: '—', value: 0 }];

  return (
    <div className="rounded-xl border p-5"
      style={{ background: 'hsl(var(--dashboard-card))', borderColor: 'hsl(var(--dashboard-card-border))' }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-5"
        style={{ color: 'hsl(var(--dashboard-text))', fontFamily: "'Space Grotesk', sans-serif" }}>
        Faturamento ao longo do tempo
      </h3>
      <div className="h-64 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
            style={{ background: 'hsl(var(--dashboard-card) / 0.7)' }}>
            <span className="text-xs" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>Carregando...</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(217, 91%, 65%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(218, 18%, 16%)" />
            <XAxis dataKey="day" stroke="hsl(218, 14%, 55%)" fontSize={10} interval="preserveStartEnd" />
            <YAxis stroke="hsl(218, 14%, 55%)" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: 'hsl(218, 22%, 12%)',
                border: '1px solid hsl(218, 18%, 20%)',
                borderRadius: '8px',
                color: 'hsl(0, 0%, 96%)',
                fontSize: '12px',
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
            />
            <Area type="monotone" dataKey="value" stroke="hsl(217, 91%, 65%)" fill="url(#revenueGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
