import { type InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export default function FormField({ label, hint, ...props }: FormFieldProps) {
  return (
    <div>
      <label className="label">{label}</label>
      {hint && <p className="text-xs text-[var(--text-muted)] mb-2 -mt-1">{hint}</p>}
      <input className="input-field" {...props} />
    </div>
  );
}
