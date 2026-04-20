import type { BillingRecord } from '@/lib/billing';

/** Mesmas regras de BillingForm + ValidationField (Lançamentos). */
export function computeLancamentosOkValues(record: BillingRecord) {
  const saldoCaixa = record.fechamento - record.abertura;
  const totalCreditoSistemaPos = record.credito + record.creditoPos;
  const totalPix = record.qrCode + record.pixPos + record.transferencia;
  const totalDebitoTefPos = record.debitoBruto + record.debitoPos;

  return {
    caixaOk:
      saldoCaixa +
      record.retirada -
      (record.dinheiro - (record.debitoPos + record.creditoPos)),
    pixOk: totalPix - record.pix,
    creditoOk: record.creditoBruto - totalCreditoSistemaPos,
    debitoOk: totalDebitoTefPos - record.debito,
  };
}

/** Mesma regra que ValidationField.tsx (valor ≈ 0 → ok; > 0 → warn; < 0 → err). */
export function validationValueClass(value: number): string {
  const isZero = Math.abs(value) < 0.01;
  if (isZero) return 'validation-ok';
  if (value > 0) return 'validation-warn';
  return 'validation-err';
}
