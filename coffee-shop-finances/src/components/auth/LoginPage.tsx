import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthz } from "@/contexts/AuthzContext";

const LoginPage = () => {
  const { signIn, register, forgotPassword, loading } = useAuthz();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Preencha e-mail e senha.");
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "Falha ao autenticar.");
      return;
    }
    toast.success("Login realizado com sucesso.");
  };

  const handleRegister = async () => {
    if (!email || !password) {
      toast.info("Preencha usuário (e-mail) e senha e clique novamente em Cadastrar usuário.");
      return;
    }
    setSubmitting(true);
    const result = await register(email, password);
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error || "Falha ao cadastrar usuário.");
      return;
    }
    toast.success(result.message || "Usuário cadastrado com sucesso.");
  };

  const handleForgotPassword = async () => {
    const result = await forgotPassword();
    if (!result.success) {
      toast.error(result.error || "Falha ao processar solicitação.");
      return;
    }
    toast.info(result.message || "Para recuperação de senha, contate o administrador.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-sm space-y-5">
        <div className="text-center space-y-2">
          <Lock className="w-8 h-8 mx-auto text-muted-foreground" />
          <h1 className="text-xl font-semibold">Entrar no sistema</h1>
          <p className="text-sm text-muted-foreground">
            Autentique-se com seu usuário e senha para acessar as telas.
          </p>
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground" htmlFor="email">
              E-mail
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || submitting}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground" htmlFor="password">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || submitting}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="pt-1 space-y-2 text-sm">
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading || submitting}
            className="w-full text-left text-primary hover:underline disabled:opacity-60"
          >
            Cadastrar usuário
          </button>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={loading || submitting}
            className="w-full text-left text-primary hover:underline disabled:opacity-60"
          >
            Esqueceu sua senha?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
