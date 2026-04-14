import { Suspense, lazy, useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import BillingForm from '@/components/BillingForm';
import ReceivablesForm from '@/components/ReceivablesForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, Settings } from 'lucide-react';
import ResumoTab from '@/components/ResumoTab';

const DashboardPage = lazy(() => import('@/components/dashboard/DashboardPage'));

const Index = () => {
  const [activePage, setActivePage] = useState('billing');

  const pageTitle: Record<string, string> = {
    billing: 'Faturamento',
    dashboard: 'Dashboard',
    reports: 'Relatórios',
    settings: 'Configurações',
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar activePage={activePage} onPageChange={setActivePage} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-header text-header-foreground px-6 h-14 flex items-center shrink-0 border-b border-border/10">
          <h1 className="text-lg font-semibold tracking-tight">{pageTitle[activePage]}</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activePage === 'billing' && (
            <Tabs defaultValue="lancamentos" className="w-full">
              <TabsList>
                <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
              <TabsTrigger value="recebiveis">Recebíveis</TabsTrigger>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              </TabsList>
              <TabsContent value="lancamentos">
                <BillingForm />
              </TabsContent>
              <TabsContent value="recebiveis">
                <ReceivablesForm />
              </TabsContent>
              <TabsContent value="resumo">
                <ResumoTab />
              </TabsContent>
            </Tabs>
          )}
          {activePage === 'dashboard' && (
            <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando dashboard...</div>}>
              <DashboardPage />
            </Suspense>
          )}
          {activePage === 'reports' && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <BarChart3 className="w-10 h-10 opacity-30" />
              <span className="text-sm">Relatórios em construção</span>
            </div>
          )}
          {activePage === 'settings' && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <Settings className="w-10 h-10 opacity-30" />
              <span className="text-sm">Configurações em construção</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
