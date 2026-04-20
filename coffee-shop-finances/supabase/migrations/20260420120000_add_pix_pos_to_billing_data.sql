-- PIX via máquina/POS (extrato banco, bloco Vendas Pix — Banco). Distinto de debito_pos/credito_pos (cartão TEF).
-- Mesmo padrão das demais colunas monetárias: DECIMAL(10,2) DEFAULT 0.
ALTER TABLE public.billing_data
ADD COLUMN IF NOT EXISTS pix_pos DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN public.billing_data.pix_pos IS 'PIX recebido via POS no banco; entra no total PIX junto com qr_code e transferencia.';
