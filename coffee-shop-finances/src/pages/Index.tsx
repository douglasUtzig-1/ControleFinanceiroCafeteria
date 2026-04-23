import { Suspense, lazy, useState } from 'react';
import AppSidebar from '@/components/AppSidebar';
import BillingForm from '@/components/BillingForm';
import ReceivablesForm from '@/components/ReceivablesForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, Lock, Settings } from 'lucide-react';
import ResumoTab from '@/components/ResumoTab';
import { useAuthz } from '@/contexts/AuthzContext';
import { PAGE_VIEW_PERMISSION, type AppPage } from '@/lib/permissions';
import SettingsPage from '@/components/settings/SettingsPage';
import LoginPage from '@/components/auth/LoginPage';

const DashboardPage = lazy(() => import('@/components/dashboard/DashboardPage'));

const Index = () => {
  const [activePage, setActivePage] = useState<AppPage>('billing');
  const { loading, user, can, session, signOut } = useAuthz();

  const pageTitle: Record<AppPage, string> = {
    billing: 'Faturamento',
    dashboard: 'Dashboard',
    reports: 'Relatórios',
    settings: 'Configurações',
  };

  const visiblePages = (Object.keys(pageTitle) as AppPage[]).filter((page) => can(PAGE_VIEW_PERMISSION[page]));
  const resolvedPage = visiblePages.includes(activePage) ? activePage : (visiblePages[0] ?? null);

  const canEditBilling = can('billing.edit');

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Carregando permissões...</div>;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!resolvedPage) {
    const awaitingProfile = user?.cargo === 'sem_perfil';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
          <h2 className="text-lg font-semibold">{awaitingProfile ? 'Aguardando liberação' : 'Acesso não concedido'}</h2>
          <p className="text-sm text-muted-foreground">
            {awaitingProfile
              ? 'Seu cadastro foi criado com sucesso. Aguarde o administrador atribuir um perfil de acesso.'
              : 'Seu usuário não possui permissões para acessar as telas do sistema.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar
        activePage={resolvedPage}
        onPageChange={(page) => setActivePage(page as AppPage)}
        visiblePages={visiblePages}
        userLabel={user?.nome || user?.email || 'Usuário'}
        onLogout={() => {
          void signOut();
        }}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-header text-header-foreground px-6 h-14 flex items-center shrink-0 border-b border-border/10">
          <h1 className="text-lg font-semibold tracking-tight">{pageTitle[resolvedPage]}</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {resolvedPage === 'billing' && (
            <Tabs defaultValue="lancamentos" className="w-full">
              <TabsList>
                <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
              <TabsTrigger value="recebiveis">Recebíveis</TabsTrigger>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              </TabsList>
              <TabsContent value="lancamentos">
                <BillingForm canEdit={canEditBilling} />
              </TabsContent>
              <TabsContent value="recebiveis">
                <ReceivablesForm canEdit={canEditBilling} />
              </TabsContent>
              <TabsContent value="resumo">
                <ResumoTab />
              </TabsContent>
            </Tabs>
          )}
          {resolvedPage === 'dashboard' && (
            <Suspense fallback={<div className="text-sm text-muted-foreground">Carregando dashboard...</div>}>
              <DashboardPage />
            </Suspense>
          )}
          {resolvedPage === 'reports' && (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <BarChart3 className="w-10 h-10 opacity-30" />
              <span className="text-sm">Relatórios em construção</span>
            </div>
          )}
          {resolvedPage === 'settings' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Gestão de Perfis e Usuários</span>
              </div>
              <SettingsPage />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
