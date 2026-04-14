import type { DreRowType } from '@/lib/dashboardMetrics';

type Row = { label: string; value: string; type: DreRowType };

type DreTableProps = {
  rows: Row[];
};

const DreTable = ({ rows }: DreTableProps) => {
  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ background: 'hsl(var(--dashboard-card))', borderColor: 'hsl(var(--dashboard-card-border))' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--dashboard-card-border))' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(var(--dashboard-text))', fontFamily: "'Space Grotesk', sans-serif" }}>
          DRE Simplificado
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: 'hsl(var(--dashboard-card-border))' }}>
        {rows.map((row, i) => (
          <div key={i}
            className={`flex justify-between items-center px-5 py-3 ${
              row.type === 'total' ? 'font-bold' : ''
            } ${row.type === 'subtotal' ? 'font-semibold' : ''}`}
            style={{
              color: row.type === 'deduction'
                ? 'hsl(var(--dashboard-text-muted))'
                : row.type === 'total'
                  ? 'hsl(var(--dashboard-accent))'
                  : 'hsl(var(--dashboard-text))',
              background: row.type === 'total' ? 'hsl(var(--dashboard-accent) / 0.08)' : 'transparent',
              borderColor: 'hsl(var(--dashboard-card-border))',
            }}>
            <span className="text-sm">{row.label}</span>
            <span className="text-sm tabular-nums">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DreTable;
