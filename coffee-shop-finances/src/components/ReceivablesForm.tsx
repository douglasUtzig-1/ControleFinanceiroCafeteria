import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { CreditCard, Wallet, Save, X, CalendarDays, Clock, ShieldCheck } from 'lucide-react';
import CurrencyInput from '@/components/CurrencyInput';
import ValidationField from '@/components/ValidationField';
import { formatCurrencyInput, formatDateBR, getLatestDate } from '@/lib/billing';
import {
  ReceivablesRecord,
  emptyReceivablesRecord,
  computeRecebiveisOk,
  loadAllReceivablesData,
  saveReceivablesRecord,
} from '@/lib/receivables';

type ReceivablesFormProps = {
  canEdit?: boolean;
};

const ReceivablesForm = ({ canEdit = true }: ReceivablesFormProps) => {
  const [allData, setAllData] = useState<Record<string, ReceivablesRecord>>({});
  const [record, setRecord] = useState<ReceivablesRecord>(emptyReceivablesRecord());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currencyFields, setCurrencyFields] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAllReceivablesData().then((data) => {
      setAllData(data);
      setLoading(false);
    });
  }, []);

  const ultimaData = useMemo(() => getLatestDate(allData), [allData]);
  const today = new Date().toISOString().split('T')[0];

  const updateField = useCallback((field: keyof ReceivablesRecord, value: number | string) => {
    setRecord((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCurrencyChange = useCallback((field: keyof ReceivablesRecord, displayValue: string, numericValue: number) => {
    setCurrencyFields(prev => ({ ...prev, [field]: displayValue }));
    updateField(field, numericValue);
  }, [updateField]);

  useEffect(() => {
    const totalLiquido =
      record.recebidoRedeDebitoBruto +
      record.recebidoRedeCreditoBruto -
      record.taxaTarifa;
    const normalizedTotalLiquido = Number(totalLiquido.toFixed(2));
    const displayValue = normalizedTotalLiquido
      ? formatCurrencyInput((normalizedTotalLiquido * 100).toFixed(0))
      : '';

    setRecord(prev => (
      prev.recebidoTotalLiquido === normalizedTotalLiquido
        ? prev
        : { ...prev, recebidoTotalLiquido: normalizedTotalLiquido }
    ));

    setCurrencyFields(prev => (
      prev.recebidoTotalLiquido === displayValue
        ? prev
        : { ...prev, recebidoTotalLiquido: displayValue }
    ));
  }, [record.recebidoRedeCreditoBruto, record.recebidoRedeDebitoBruto, record.taxaTarifa]);

  const resetForm = useCallback((date: string = '') => {
    setRecord(emptyReceivablesRecord(date));
    setCurrencyFields({});
    setIsEditing(false);
  }, []);

  const setCurrencyFromRecord = useCallback((data: ReceivablesRecord) => {
    const fields: (keyof ReceivablesRecord)[] = [
      'recebidoItauDebito',
      'recebidoItauCredito',
      'recebidoItauPix',
      'depositoDinheiro',
      'recebidoRedeDebitoBruto',
      'recebidoRedeCreditoBruto',
      'taxaTarifa',
      'recebidoTotalLiquido',
    ];
    const nextCurrency: Record<string, string> = {};
    fields.forEach((field) => {
      const value = data[field] as number;
      nextCurrency[field] = value ? formatCurrencyInput((value * 100).toFixed(0)) : '';
    });
    setCurrencyFields(nextCurrency);
  }, []);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (!selectedDate) return;

    const selected = new Date(`${selectedDate}T23:59:59`);
    const todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999);
    if (selected > todayDate) {
      toast.error('Não é permitido selecionar datas futuras.');
      return;
    }

    if (allData[selectedDate]) {
      const confirmed = window.confirm(
        'Data com informações já cadastradas em recebíveis, quer alterar as informações desta data?'
      );
      if (confirmed) {
        const existing = allData[selectedDate];
        setRecord(existing);
        setCurrencyFromRecord(existing);
        setIsEditing(true);
      } else {
        resetForm(selectedDate);
      }
    } else {
      resetForm(selectedDate);
    }

    updateField('data', selectedDate);
  }, [allData, resetForm, setCurrencyFromRecord, updateField]);

  const handleSave = useCallback(async () => {
    if (!canEdit) {
      toast.error('Você não possui permissão para editar faturamento.');
      return;
    }
    if (!record.data) {
      toast.error('Por favor, selecione uma data.');
      return;
    }

    if (isEditing) {
      const confirmed = window.confirm(
        'Está alterando um recebível já existente, deseja seguir?'
      );
      if (!confirmed) {
        resetForm();
        return;
      }
    }

    setSaving(true);
    const result = await saveReceivablesRecord(record);
    setSaving(false);

    if (result.success) {
      toast.success(isEditing ? 'Recebíveis atualizados com sucesso!' : 'Recebíveis salvos com sucesso!');
      const newData = await loadAllReceivablesData();
      setAllData(newData);
      setIsEditing(false);
    } else {
      toast.error(result.error || 'Erro ao salvar recebíveis.');
    }
  }, [canEdit, isEditing, record, resetForm]);

  const handleCancel = useCallback(() => {
    resetForm();
  }, [resetForm]);

  const recebiveisOk = computeRecebiveisOk(record);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando recebíveis...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="billing-section !p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="billing-section-icon">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="receivables-data" className="text-sm font-semibold text-foreground whitespace-nowrap">
                Data do Lançamento
              </label>
              <input
                type="date"
                id="receivables-data"
                max={today}
                value={record.data}
                onChange={handleDateChange}
                className="px-3 py-2 border border-input rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Último lançamento: <strong className="text-foreground">{formatDateBR(ultimaData)}</strong></span>
          </div>
        </div>
      </div>

      <fieldset
        disabled={!record.data || !canEdit}
        className="border-0 p-0 m-0 w-full min-w-0 space-y-5 disabled:opacity-60 disabled:pointer-events-none"
      >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Cartões Recebíveis */}
        <div className="billing-section">
          <div className="billing-section-header">
            <div className="billing-section-icon">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="billing-section-title">Conta Bancária</div>
          </div>
          <CurrencyInput id="recebidoItauDebito" label="Recebido Itaú - Débito" value={currencyFields.recebidoItauDebito || ''} onChange={(d, n) => handleCurrencyChange('recebidoItauDebito', d, n)} />
          <CurrencyInput id="recebidoItauCredito" label="Recebido Itaú - Crédito" value={currencyFields.recebidoItauCredito || ''} onChange={(d, n) => handleCurrencyChange('recebidoItauCredito', d, n)} />
          <CurrencyInput id="recebidoItauPix" label="Recebido Itaú - PIX" value={currencyFields.recebidoItauPix || ''} onChange={(d, n) => handleCurrencyChange('recebidoItauPix', d, n)} />
          <CurrencyInput id="depositoDinheiro" label="Depósito Dinheiro" value={currencyFields.depositoDinheiro || ''} onChange={(d, n) => handleCurrencyChange('depositoDinheiro', d, n)} />
        </div>

        {/* Cartões */}
        <div className="billing-section">
          <div className="billing-section-header">
            <div className="billing-section-icon">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="billing-section-title">Adquirência</div>
          </div>
          <CurrencyInput id="recebidoAdqCrdBruto" label="Recebido Rede - Débito (Bruto)" value={currencyFields.recebidoRedeDebitoBruto || ''} onChange={(d, n) => handleCurrencyChange('recebidoRedeDebitoBruto', d, n)} />
          <CurrencyInput id="recebidoAdqDbBruto" label="Recebido Rede - Crédito (Bruto)" value={currencyFields.recebidoRedeCreditoBruto || ''} onChange={(d, n) => handleCurrencyChange('recebidoRedeCreditoBruto', d, n)} />
          <CurrencyInput id="taxaTarifa" label="Taxa/Tarifa" value={currencyFields.taxaTarifa || ''} onChange={(d, n) => handleCurrencyChange('taxaTarifa', d, n)} />
          <CurrencyInput id="recebidoTotalLiquido" label="Recebido Total - Líquido" value={currencyFields.recebidoTotalLiquido || ''} onChange={(d, n) => handleCurrencyChange('recebidoTotalLiquido', d, n)} readOnly />
        </div>
      </div>

      <div className="billing-section">
        <div className="billing-section-header">
          <div className="billing-section-icon">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="billing-section-title">Validação</div>
        </div>
        <div className="max-w-xl">
          <ValidationField
            label="Recebiveis OK?"
            value={recebiveisOk}
            successMsg="Recebiveis OK!"
            warningMsg="Valor na conta maior que no cartão, revisar adquirência"
            errorMsg="Valor na conta MENOR que no cartão, revisar conta bancária"
          />
        </div>
      </div>
      </fieldset>

      <div className="flex gap-3 justify-end pb-6">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-2 px-5 py-2.5 bg-card text-muted-foreground border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-all"
        >
          <X className="w-4 h-4" />
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !record.data || !canEdit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-primary-foreground transition-all disabled:opacity-50 hover:opacity-90"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
      {!canEdit && (
        <p className="text-xs text-muted-foreground pb-6">
          Seu perfil possui acesso de visualização para faturamento.
        </p>
      )}
    </div>
  );
};

export default ReceivablesForm;
