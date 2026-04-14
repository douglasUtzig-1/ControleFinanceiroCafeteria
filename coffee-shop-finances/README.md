# Bem-vindo(a) ao seu controle financeiro da cafeteria

## Informações do projeto

**URL**: [Lovable](https://lovable.dev) — use o ID do seu projeto na URL do dashboard quando já existir.

## Como posso editar este código?

Existem várias maneiras de editar sua aplicação.

**Usar o Lovable**

Basta acessar o [Lovable](https://lovable.dev) e abrir o seu projeto para enviar prompts.

As mudanças feitas via Lovable serão commitadas automaticamente neste repositório.

**Usar sua IDE preferida**

Se você quiser trabalhar localmente usando sua própria IDE, pode clonar este repositório e enviar (push) as mudanças. As mudanças enviadas também serão refletidas no Lovable.

O único requisito é ter Node.js e npm instalados — [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

## Supabase (projeto oficial)

- **Project ref:** `gwsuvkcbgczihtqcjjux`
- **URL esperada:** `https://gwsuvkcbgczihtqcjjux.supabase.co`
- O app bloqueia `dev/build/check` quando `.env` ou variáveis Supabase estão inconsistentes.

Fluxo recomendado para evoluir schema sem dessincronizar app e banco:

```sh
# 1) Criar/editar migrações em supabase/migrations
# 2) Aplicar no projeto já linkado
npm run supabase:db:push

# 3) Regenerar tipos TypeScript
npm run supabase:types

# 4) Validar ambiente + schema acessível
npm run check:supabase

# Atalho para os 3 passos
npm run supabase:sync
```

Siga estes passos:

```sh
# Passo 1: Clone o repositório usando a URL Git do projeto.
git clone <YOUR_GIT_URL>

# Passo 2: Entre na pasta do repositório (raiz) ou direto na pasta da app.
cd <YOUR_PROJECT_NAME>
# Se o clone tiver pasta aninhada coffee-shop-finances/coffee-shop-finances, use essa última para npm i,
# ou na raiz do repo: npm run install:app && npm run dev

# Passo 3: Instale as dependências necessárias.
npm i

# Passo 4: Inicie o servidor de desenvolvimento (http://localhost:8080).
npm run dev
```

**Editar um arquivo diretamente no GitHub**

- Navegue até o(s) arquivo(s) desejado(s).
- Clique no botão "Edit" (ícone de lápis) no canto superior direito da visualização do arquivo.
- Faça suas alterações e faça commit.

**Usar o GitHub Codespaces**

- Vá para a página principal do seu repositório.
- Clique no botão "Code" (botão verde) perto do canto superior direito.
- Selecione a aba "Codespaces".
- Clique em "New codespace" para iniciar um novo ambiente do Codespace.
- Edite os arquivos diretamente no Codespace e faça commit e push das alterações quando terminar.

## Quais tecnologias são usadas neste projeto?

Este projeto foi construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Como posso fazer deploy deste projeto?

Basta abrir o [Lovable](https://lovable.dev), seu projeto, e clicar em Share → Publish.

## Posso conectar um domínio personalizado ao meu projeto no Lovable?

Sim!

Para conectar um domínio, vá em Project > Settings > Domains e clique em Connect Domain.

Leia mais aqui: [Configurando um domínio personalizado](https://docs.lovable.dev/features/custom-domain#custom-domain)
