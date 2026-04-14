import { useCallback, useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { loadBillingDataByPeriod } from '@/lib/billing';
import { loadReceivablesDataByPeriod } from '@/lib/receivables';
import { computeDashboardMetrics, type DashboardMetrics } from '@/lib/dashboardMetrics';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const end = new Date();
    const start = subDays(end, 29);
    const startIso = format(start, 'yyyy-MM-dd');
    const endIso = format(end, 'yyyy-MM-dd');
    try {
      const [billing, receivables] = await Promise.all([
        loadBillingDataByPeriod(startIso, endIso),
        loadReceivablesDataByPeriod(startIso, endIso),
      ]);
      setMetrics(computeDashboardMetrics(billing, receivables, start, end));
    } catch (e) {
      console.error('Dashboard load error:', e);
      setError('Não foi possível carregar os dados.');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { loading, error, metrics, reload: load };
}
