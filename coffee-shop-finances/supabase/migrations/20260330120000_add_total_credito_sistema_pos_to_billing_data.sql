-- Total Crédito (Sistema + POS) = credito + credito_pos (persistido para relatórios/auditoria)
ALTER TABLE public.billing_data
  ADD COLUMN IF NOT EXISTS total_credito_sistema_pos DECIMAL(10, 2) NOT NULL DEFAULT 0;

UPDATE public.billing_data
SET total_credito_sistema_pos = COALESCE(credito, 0) + COALESCE(credito_pos, 0);
