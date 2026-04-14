

## Plano: Adicionar abas "Lançamentos" e "Recebíveis" na tela de Faturamento

### O que será feito

Quando a página ativa for "Faturamento", o conteúdo será organizado em duas abas usando o componente `Tabs` já existente no projeto (`src/components/ui/tabs.tsx`):

1. **Lançamentos** — contém o formulário atual (`BillingForm`) sem nenhuma alteração
2. **Recebíveis** — nova aba com placeholder "em construção" por enquanto

### Alterações técnicas

**Arquivo: `src/pages/Index.tsx`**
- Importar `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` de `@/components/ui/tabs`
- Envolver o bloco `{activePage === 'billing' && <BillingForm />}` em um componente `Tabs` com duas abas
- A aba "Recebíveis" exibirá um placeholder com ícone e texto indicando construção

Nenhuma regra de negócio será alterada. Apenas 1 arquivo modificado.

