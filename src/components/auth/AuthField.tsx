import { useState, type InputHTMLAttributes } from 'react';

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: string;
  showToggle?: boolean;
}

export function AuthField({
  label,
  icon,
  showToggle,
  type = 'text',
  className = '',
  ...props
}: AuthFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showToggle && visible ? 'text' : type;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-violet-200 mb-1.5">{label}</label>
      <div className="relative group">
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none transition group-focus-within:scale-110"
          aria-hidden
        >
          {icon}
        </span>
        <input
          type={inputType}
          className={`input-dark w-full rounded-xl pl-11 pr-11 py-2.5 text-[#f5f3ff] transition-all group-focus-within:shadow-[0_0_20px_rgba(168,85,247,0.2)] ${className}`}
          {...props}
        />
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-fuchsia-300 text-sm px-1 transition"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? '🙈' : '👁'}
          </button>
        )}
      </div>
    </div>
  );
}
