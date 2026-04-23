import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  CalendarDays,
  Wallet,
  QrCode,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  FileText,
  Save,
  X,
  Clock,
  Upload,
  Trash2,
} from 'lucide-react';
import CurrencyInput from '@/components/CurrencyInput';
import CalculatedField from '@/components/CalculatedField';
import ValidationField from '@/components/ValidationField';
import {
  BillingRecord,
  emptyRecord,
  formatDateBR,
  loadAllBillingData,
  saveBillingRecord,
  getLatestDate,
  formatCurrencyInput,
} from '@/lib/billing';
import { computeLancamentosOkValues } from '@/lib/billingValidation';

type BillingFormProps = {
  canEdit?: boolean;
};

const BillingForm = ({ canEdit = true }: BillingFormProps) => {
  const [allData, setAllData] = useState<Record<string, BillingRecord>>({});
  const [record, setRecord] = useState<BillingRecord>(emptyRecord());
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    loadAllBillingData().then(data => {
      setAllData(data);
      setLoading(false);
    });
  }, []);

  const ultimaData = useMemo(() => getLatestDate(allData), [allData]);
  const today = new Date().toISOString().split('T')[0];

  const updateField = useCallback((field: keyof BillingRecord, value: number | string) => {
    setRecord(prev => ({ ...prev, [field]: value }));
  }, []);

  const [currencyFields, setCurrencyFields] = useState<Record<string, string>>({});

  const setCurrencyField = useCallback((field: string, displayValue: string, numericValue: number) => {
    setCurrencyFields(prev => ({ ...prev, [field]: displayValue }));
    updateField(field as keyof BillingRecord, numericValue);
  }, [updateField]);

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (!selectedDate) return;

    const selected = new Date(selectedDate + 'T23:59:59');
    const todayDate = new Date();
    todayDate.setHours(23, 59, 59, 999);

    if (selected > todayDate) {
      toast.error('Não é permitido selecionar datas futuras.');
      return;
    }

    if (allData[selectedDate]) {
      const confirmed = window.confirm(
        'Data com informações já cadastradas, quer alterar as informações desta data?'
      );
      if (confirmed) {
        const existing = allData[selectedDate];
        setRecord(existing);
        const fields: (keyof BillingRecord)[] = [
          'abertura', 'fechamento', 'dinheiro', 'pix', 'credito', 'debito',
          'qrCode', 'pixPos', 'retirada', 'transferencia', 'debitoBruto', 'debitoLiquido',
          'creditoBruto', 'creditoLiquido', 'debitoPos', 'creditoPos'
        ];
        const newCurrency: Record<string, string> = {};
        fields.forEach(f => {
          const val = existing[f] as number;
          newCurrency[f] = val ? formatCurrencyInput((val * 100).toFixed(0)) : '';
        });
        setCurrencyFields(newCurrency);
        setIsEditing(true);
      } else {
        setRecord(emptyRecord(selectedDate));
        setCurrencyFields({});
        setIsEditing(false);
      }
    } else {
      setRecord(emptyRecord(selectedDate));
      setCurrencyFields({});
      setIsEditing(false);
    }

    updateField('data', selectedDate);
  }, [allData, updateField]);

  // Calculations
  const saldoCaixa = record.fechamento - record.abertura;
  const totalSistema = record.dinheiro + record.pix + record.credito + record.debito;
  const ticketMedio = record.qtdeVendas > 0 ? totalSistema / record.qtdeVendas : 0;
  const totalCreditoSistemaPos = record.credito + record.creditoPos;
  const totalPix = record.qrCode + record.pixPos + record.transferencia;
  const totalCartaoBruto = record.debitoBruto + record.creditoBruto;
  const totalCartaoLiquido = record.debitoLiquido + record.creditoLiquido;
  const totalCreditoTefPos = record.creditoBruto + record.creditoPos;
  const totalDebitoTefPos = record.debitoBruto + record.debitoPos;
  const { caixaOk, pixOk, creditoOk, debitoOk } = computeLancamentosOkValues(record);

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
        'Está alterando um lançamento já existente, deseja seguir?'
      );
      if (!confirmed) {
        setRecord(emptyRecord());
        setCurrencyFields({});
        setIsEditing(false);
        return;
      }
    }

    setSaving(true);
    const result = await saveBillingRecord(record);
    setSaving(false);

    if (result.success) {
      toast.success(isEditing ? 'Dados atualizados com sucesso!' : 'Dados salvos com sucesso!');
      const newData = await loadAllBillingData();
      setAllData(newData);
      setIsEditing(false);
    } else {
      toast.error(result.error || 'Erro ao salvar dados.');
    }
  }, [canEdit, record, isEditing]);

  const handleCancel = useCallback(() => {
    setRecord(emptyRecord());
    setCurrencyFields({});
    setIsEditing(false);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full space-y-5">
      {/* Date Bar */}
      <div className="billing-section !p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="billing-section-icon">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="data" className="text-sm font-semibold text-foreground whitespace-nowrap">
                Data do Lançamento
              </label>
              <input
                type="date"
                id="data"
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
      {/* Sections grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <div className="space-y-5">
          {/* CAIXA */}
          <div className="billing-section">
            <div className="billing-section-header">
              <div className="billing-section-icon">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="billing-section-title">Caixa</div>
            </div>
            <CurrencyInput id="abertura" label="Abertura" value={currencyFields.abertura || ''} onChange={(d, n) => setCurrencyField('abertura', d, n)} />
            <CurrencyInput id="fechamento" label="Fechamento" value={currencyFields.fechamento || ''} onChange={(d, n) => setCurrencyField('fechamento', d, n)} />
            <CalculatedField label="Saldo caixa" value={saldoCaixa} />
          </div>

          {/* Vendas Cartão */}
          <div className="billing-section">
            <div className="billing-section-header">
              <div className="billing-section-icon">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="billing-section-title">Vendas Cartão</div>
            </div>
            <CurrencyInput id="debitoBruto" label="Débito Bruto" value={currencyFields.debitoBruto || ''} onChange={(d, n) => setCurrencyField('debitoBruto', d, n)} />
            <CurrencyInput id="debitoLiquido" label="Débito Liquido" value={currencyFields.debitoLiquido || ''} onChange={(d, n) => setCurrencyField('debitoLiquido', d, n)} />
            <CurrencyInput id="creditoBruto" label="Crédito Bruto" value={currencyFields.creditoBruto || ''} onChange={(d, n) => setCurrencyField('creditoBruto', d, n)} />
            <CurrencyInput id="creditoLiquido" label="Crédito Liquido" value={currencyFields.creditoLiquido || ''} onChange={(d, n) => setCurrencyField('creditoLiquido', d, n)} />
            <CurrencyInput id="debitoPos" label="Débito POS" value={currencyFields.debitoPos || ''} onChange={(d, n) => setCurrencyField('debitoPos', d, n)} />
            <CurrencyInput id="creditoPos" label="Crédito POS" value={currencyFields.creditoPos || ''} onChange={(d, n) => setCurrencyField('creditoPos', d, n)} />
            <CalculatedField label="Total Cartão Bruto" value={totalCartaoBruto} />
            <CalculatedField label="Total Cartão Liquido" value={totalCartaoLiquido} />
            <CalculatedField label="Total Crédito (TEF + POS)" value={totalCreditoTefPos} />
            <CalculatedField label="Total Débito (TEF + POS)" value={totalDebitoTefPos} />
          </div>
        </div>

        <div className="space-y-5">
          {/* Vendas Sistema */}
          <div className="billing-section">
            <div className="billing-section-header">
              <div className="billing-section-icon">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="billing-section-title">Vendas Sistema</div>
            </div>
            <div className="billing-input-group">
              <label htmlFor="qtdeVendas">Qtde Vendas</label>
              <input
                type="number"
                id="qtdeVendas"
                value={record.qtdeVendas || ''}
                onChange={e => updateField('qtdeVendas', parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <CurrencyInput id="dinheiro" label="Dinheiro" value={currencyFields.dinheiro || ''} onChange={(d, n) => setCurrencyField('dinheiro', d, n)} />
            <CurrencyInput id="pix" label="PIX" value={currencyFields.pix || ''} onChange={(d, n) => setCurrencyField('pix', d, n)} />
            <CurrencyInput id="credito" label="Crédito" value={currencyFields.credito || ''} onChange={(d, n) => setCurrencyField('credito', d, n)} />
            <CurrencyInput id="debito" label="Débito" value={currencyFields.debito || ''} onChange={(d, n) => setCurrencyField('debito', d, n)} />
            <CalculatedField label="Total Sistema" value={totalSistema} />
            <CalculatedField label="Ticket Médio" value={ticketMedio} />
            <CalculatedField label="Total Crédito (Sistema + POS)" value={totalCreditoSistemaPos} />
          </div>

          {/* Vendas PIX */}
          <div className="billing-section">
            <div className="billing-section-header">
              <div className="billing-section-icon">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="billing-section-title">Vendas Pix — Banco</div>
            </div>
            <CurrencyInput id="qrCode" label="QR Code" value={currencyFields.qrCode || ''} onChange={(d, n) => setCurrencyField('qrCode', d, n)} />
            <CurrencyInput id="pixPos" label="POS" value={currencyFields.pixPos || ''} onChange={(d, n) => setCurrencyField('pixPos', d, n)} />
            <CurrencyInput id="transferencia" label="Transferência" value={currencyFields.transferencia || ''} onChange={(d, n) => setCurrencyField('transferencia', d, n)} />
            <CurrencyInput id="retirada" label="Retirada" value={currencyFields.retirada || ''} onChange={(d, n) => setCurrencyField('retirada', d, n)} />
            <CalculatedField label="Total PIX" value={totalPix} />
          </div>
        </div>
      </div>

      {/* Validação */}
      <div className="billing-section">
        <div className="billing-section-header">
          <div className="billing-section-icon">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="billing-section-title">Validação</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <ValidationField
              label="Caixa OK?"
              value={caixaOk}
              successMsg="Caixa OK!"
              warningMsg="Sobrou dinheiro no caixa, algum lançamento não foi realizado!"
              errorMsg="Faltou dinheiro no caixa, alguma venda não foi recebida!"
            />
            <ValidationField
              label="Crédito OK?"
              value={creditoOk}
              successMsg="Crédito OK!"
              warningMsg="Alguma venda crédito não foi registrada no sistema"
              errorMsg="Alguma venda crédito não fei cobrada"
            />
          </div>
          <div className="space-y-4">
            <ValidationField
              label="PIX OK?"
              value={pixOk}
              successMsg="PIX OK!"
              warningMsg="Sobrou PIX na conta, alguma venda não foi registrada no sistema!"
              errorMsg="Faltou PIX na conta, alguma venda não foi recebida!"
            />
            <ValidationField
              label="Débito OK?"
              value={debitoOk}
              successMsg="Débito OK!"
              warningMsg="Alguma venda débito não foi registrada no sistema"
              errorMsg="Alguma venda débito não foi cobrada"
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="billing-section">
        <div className="billing-section-header">
          <div className="billing-section-icon">
            <FileText className="w-4 h-4" />
          </div>
          <div className="billing-section-title">Observações</div>
        </div>
        <textarea
          id="observacoes"
          value={record.observacoes}
          onChange={e => updateField('observacoes', e.target.value)}
          placeholder="Registre aqui informações sobre inconsistências ou observações importantes..."
          className="w-full px-3 py-2.5 border border-input rounded-lg text-sm bg-background text-foreground resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Upload de Arquivos */}
      <div className="billing-section">
        <div className="billing-section-header">
          <div className="billing-section-icon">
            <Upload className="w-4 h-4" />
          </div>
          <div className="billing-section-title">Anexos</div>
        </div>
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">Clique ou arraste arquivos CSV, Excel</span>
          <span className="text-xs text-muted-foreground/60 mt-1">.csv, .xls, .xlsx</span>
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xls,.xlsx"
            multiple
            className="hidden"
            onChange={e => {
              const files = Array.from(e.target.files || []);
              setUploadedFiles(prev => [...prev, ...files]);
              e.target.value = '';
            }}
          />
        </label>
        {uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {uploadedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg text-sm">
                <span className="text-foreground truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                  className="text-muted-foreground hover:text-destructive transition-colors ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
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

export default BillingForm;
