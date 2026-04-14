import { formatDateBR } from '@/lib/billing';

export type RecentRow = {
  data: string;
  produto: string;
  valor: string;
  forma: string;
};

type RecentActivityTableProps = {
  rows: RecentRow[];
  loading?: boolean;
};

const RecentActivityTable = ({ rows, loading }: RecentActivityTableProps) => {
  const showPlaceholder = !loading && rows.length === 0;

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ background: 'hsl(var(--dashboard-card))', borderColor: 'hsl(var(--dashboard-card-border))' }}>
      <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--dashboard-card-border))' }}>
        <h3 className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(var(--dashboard-text))', fontFamily: "'Space Grotesk', sans-serif" }}>
          Atividade Recente
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderColor: 'hsl(var(--dashboard-card-border))' }} className="border-b">
              {['Data', 'Descrição', 'Valor', 'Forma de Pagamento'].map(col => (
                <th key={col} className="text-left px-5 py-3 font-medium text-xs uppercase tracking-wider"
                  style={{ color: 'hsl(var(--dashboard-text-muted))' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderColor: 'hsl(var(--dashboard-card-border))' }}
                  className={i < 4 ? 'border-b' : ''}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-5 py-3">
                      <div className="h-4 rounded animate-pulse"
                        style={{ background: 'hsl(var(--dashboard-card-border))', width: j === 0 ? '80px' : j === 2 ? '70px' : '100px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : showPlaceholder ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-xs" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>
                  Nenhum lançamento nos últimos 30 dias. Inclua dados em Faturamento → Lançamentos.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.data + i} style={{ borderColor: 'hsl(var(--dashboard-card-border))' }}
                  className={i < rows.length - 1 ? 'border-b' : ''}>
                  <td className="px-5 py-3 whitespace-nowrap" style={{ color: 'hsl(var(--dashboard-text))' }}>
                    {formatDateBR(row.data)}
                  </td>
                  <td className="px-5 py-3" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>{row.produto}</td>
                  <td className="px-5 py-3 tabular-nums" style={{ color: 'hsl(var(--dashboard-text))' }}>{row.valor}</td>
                  <td className="px-5 py-3" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>{row.forma}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!showPlaceholder && !loading && (
        <div className="px-5 py-4 text-center">
          <p className="text-xs" style={{ color: 'hsl(var(--dashboard-text-muted))' }}>
            Últimos dias com lançamento (máx. 5)
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentActivityTable;
