import { useCallback } from 'react';
import { formatCurrencyInput, parseCurrency } from '@/lib/billing';

interface CurrencyInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string, numericValue: number) => void;
  readOnly?: boolean;
}

const CurrencyInput = ({ id, label, value, onChange, readOnly = false }: CurrencyInputProps) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const formatted = formatCurrencyInput(e.target.value);
    onChange(formatted, parseCurrency(formatted));
  }, [onChange, readOnly]);

  return (
    <div className="billing-input-group">
      <label htmlFor={id}>{label}</label>
      <input
        type="text"
        id={id}
        className="currency"
        value={value}
        onChange={handleChange}
        placeholder="0,00"
        readOnly={readOnly}
      />
    </div>
  );
};

export default CurrencyInput;
