# Schema esperado (app ↔ Postgres)

Tabelas criadas pelas migrações em `supabase/migrations/`.

## `billing_data`

| Coluna (DB) | App (`BillingRecord`) |
|-------------|------------------------|
| `id` (PK, BIGINT identity) | *(não usado no app)* |
| `data` (UNIQUE, DATE) | `data` |
| `abertura` | `abertura` |
| `fechamento` | `fechamento` |
| `qtde_vendas` | `qtdeVendas` |
| `dinheiro` | `dinheiro` |
| `pix` | `pix` |
| `credito` | `credito` |
| `debito` | `debito` |
| `qr_code` | `qrCode` |
| `retirada` | `retirada` |
| `transferencia` | `transferencia` |
| `debito_bruto` | `debitoBruto` |
| `debito_liquido` | `debitoLiquido` |
| `credito_bruto` | `creditoBruto` |
| `credito_liquido` | `creditoLiquido` |
| `debito_pos` | `debitoPos` |
| `credito_pos` | `creditoPos` |
| `total_credito_sistema_pos` | `totalCreditoSistemaPos` (persistido: crédito + crédito POS) |
| `observacoes` | `observacoes` |
| `created_at` / `updated_at` | *(interno de auditoria)* |

## `receivables_data`

| Coluna (DB) | App (`ReceivablesRecord`) |
|-------------|---------------------------|
| `id` (PK, BIGINT identity) | *(não usado no app)* |
| `data` (UNIQUE, DATE) | `data` |
| `recebido_itau_debito` | `recebidoItauDebito` |
| `recebido_itau_credito` | `recebidoItauCredito` |
| `recebido_itau_pix` | `recebidoItauPix` |
| `deposito_dinheiro` | `depositoDinheiro` |
| `recebido_rede_debito_bruto` | `recebidoRedeDebitoBruto` |
| `recebido_rede_credito_bruto` | `recebidoRedeCreditoBruto` |
| `taxa_tarifa` | `taxaTarifa` |
| `recebido_total_liquido` | `recebidoTotalLiquido` |
| `created_at` / `updated_at` | *(interno de auditoria)* |

## Segurança e automações no banco

- RLS habilitado em `billing_data` e `receivables_data`.
- Policies abertas de `SELECT/INSERT/UPDATE/DELETE` (modelo atual do projeto).
- Trigger `update_updated_at_column()` aplicado nas duas tabelas para atualizar `updated_at`.
