import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

const KpiCard = ({ label, value, trend = 'neutral', trendLabel }: KpiCardProps) => {
  const trendColor = trend === 'up'
    ? 'text-[hsl(var(--dashboard-positive))]'
    : trend === 'down'
      ? 'text-[hsl(var(--dashboard-negative))]'
      : 'text-[hsl(var(--dashboard-text-muted))]';

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: 'hsl(var(--dashboard-card))',
        borderColor: 'hsl(var(--dashboard-card-border))',
      }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-3"
        style={{ color: 'hsl(var(--dashboard-text-muted))' }}>
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums mb-2"
        style={{ color: 'hsl(var(--dashboard-text))', fontFamily: "'Space Grotesk', sans-serif" }}>
        {value}
      </p>
      {trendLabel && (
        <div className={`flex items-center gap-1.5 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
};

export default KpiCard;
