import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured, SUPABASE_SETUP_HELP } from "@/integrations/supabase/client";
import { validateSupabaseClientEnv } from "@/integrations/supabase/config";
import { AuthzProvider, useAuthz } from "@/contexts/AuthzContext";

const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient();
const envValidation = validateSupabaseClientEnv();
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const AppShell = () => {
  const { session, signOut } = useAuthz();

  useEffect(() => {
    if (!session) return;

    let timerId: ReturnType<typeof setTimeout> | undefined;
    let hasLoggedOut = false;

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);
      timerId = setTimeout(async () => {
        if (hasLoggedOut) return;
        hasLoggedOut = true;
        await signOut();
        toast.info("Sessão encerrada por inatividade.");
      }, IDLE_TIMEOUT_MS);
    };

    const events: (keyof WindowEventMap)[] = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];

    for (const eventName of events) {
      window.addEventListener(eventName, resetTimer, { passive: true });
    }

    document.addEventListener("visibilitychange", resetTimer);
    resetTimer();

    return () => {
      if (timerId) clearTimeout(timerId);
      for (const eventName of events) {
        window.removeEventListener(eventName, resetTimer);
      }
      document.removeEventListener("visibilitychange", resetTimer);
    };
  }, [session, signOut]);

  return (
    <>
      {!isSupabaseConfigured && (
        <div className="fixed top-0 left-0 right-0 z-[100] border-b border-amber-500/40 bg-amber-50 px-4 py-2 text-amber-950 shadow-sm dark:bg-amber-950/40 dark:text-amber-50">
          <Alert className="border-amber-500/30 bg-transparent">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle>Supabase não configurado</AlertTitle>
            <AlertDescription>
              {SUPABASE_SETUP_HELP}
              {envValidation.errors.length > 0 && (
                <span className="mt-2 block text-xs">
                  {envValidation.errors.join(" ")}
                </span>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className={!isSupabaseConfigured ? "pt-[5.5rem]" : undefined}>
          <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Carregando...</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthzProvider>
        <AppShell />
      </AuthzProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
