import { formatCurrency } from '@/lib/billing';

interface CalculatedFieldProps {
  label: string;
  value: number;
}

const CalculatedField = ({ label, value }: CalculatedFieldProps) => (
  <div className="billing-calculated">
    <span className="label">{label}</span>
    <span className="value">{formatCurrency(value)}</span>
  </div>
);

export default CalculatedField;
