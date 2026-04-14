import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type Point = { day: string; vendas: number };

type SalesBarChartProps = {
  data: Point[];
  loading?: boolean;
};

const SalesBarChart = ({ data, loading }: SalesBarChartProps) => {
  const chartData = data.length > 0 ? data : [{ day: '—', vendas: 0 }];

  return (
    <div className="rounded-xl border p-5"
      style={{ background: 'hsl(var(--dashboard-card))', borderColor: 'hsl(var(--dashboard-card-border))' }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-5"
        style={{ color: 'hsl(var(--dashboard-text))', fontFamily: "'Space Grotesk', sans-serif" }}>
        Vendas por dia da semana (período)
      </h3>
      <div className="h-64 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
            style={{ background: 'hsl(var(--dashboard-card) / 0.7)' }}>
            <span className="text-xs" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>Carregando...</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(218, 18%, 16%)" />
            <XAxis dataKey="day" stroke="hsl(218, 14%, 55%)" fontSize={12} />
            <YAxis stroke="hsl(218, 14%, 55%)" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(218, 22%, 12%)',
                border: '1px solid hsl(218, 18%, 20%)',
                borderRadius: '8px',
                color: 'hsl(0, 0%, 96%)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="vendas" fill="hsl(217, 91%, 65%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesBarChart;
