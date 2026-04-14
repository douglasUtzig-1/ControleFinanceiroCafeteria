import { formatCurrency } from '@/lib/billing';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ValidationFieldProps {
  label: string;
  value: number;
  successMsg: string;
  warningMsg: string;
  errorMsg: string;
}

const ValidationField = ({ label, value, successMsg, warningMsg, errorMsg }: ValidationFieldProps) => {
  const isZero = Math.abs(value) < 0.01;
  const isPositive = value > 0;

  let Icon = CheckCircle2;
  let iconClass = 'validation-ok';
  let msgClass = 'validation-msg-ok';
  let message = successMsg;

  if (!isZero && isPositive) {
    Icon = AlertTriangle;
    iconClass = 'validation-warn';
    msgClass = 'validation-msg-warn';
    message = warningMsg;
  } else if (!isZero) {
    Icon = XCircle;
    iconClass = 'validation-err';
    msgClass = 'validation-msg-err';
    message = errorMsg;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center px-3 py-3 bg-background border border-border rounded-lg">
        <span className="flex items-center gap-2 font-medium text-sm text-muted-foreground">
          <Icon className={`w-4 h-4 ${iconClass}`} />
          {label}
        </span>
        <span className="font-bold text-sm text-foreground tabular-nums">{formatCurrency(value)}</span>
      </div>
      {message && <div className={msgClass}>{message}</div>}
    </div>
  );
};

export default ValidationField;
