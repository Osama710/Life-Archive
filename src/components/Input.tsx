import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? "border-error ring-2 ring-error/20" : ""} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="mt-1.5 text-xs text-ink/45">{hint}</p>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
};
