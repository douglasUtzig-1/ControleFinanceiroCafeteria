import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

type Slice = { name: string; value: number };

type CmvPieChartProps = {
  data: Slice[];
};

const COLORS = ['hsl(217, 91%, 65%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)'];

const CmvPieChart = ({ data }: CmvPieChartProps) => {
  const chartData = data.filter((d) => d.value > 0);
  const hasData = chartData.length > 0 && chartData.some((d) => d.value > 0);

  return (
    <div className="rounded-xl border p-5"
      style={{ background: 'hsl(var(--dashboard-card))', borderColor: 'hsl(var(--dashboard-card-border))' }}>
      <h3 className="text-sm font-semibold uppercase tracking-wider mb-5"
        style={{ color: 'hsl(var(--dashboard-text))', fontFamily: "'Space Grotesk', sans-serif" }}>
        Mix de faturamento
      </h3>
      <p className="text-xs mb-3" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>
        Dinheiro/PIX, cartão líquido e demais (lançamentos)
      </p>
      <div className="h-52 flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center"
              style={{ borderColor: 'hsl(var(--dashboard-card-border))' }}>
              <span className="text-xs" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>
                Sem dados
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-2 justify-center">
              {data.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CmvPieChart;
