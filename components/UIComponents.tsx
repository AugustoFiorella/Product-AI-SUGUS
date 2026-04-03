import React, { useRef, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Material Web component registrations (side-effect imports)
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/labs/card/outlined-card.js';

// Allows CSS custom properties (--md-*) in React style objects
type StyleWithTokens = React.CSSProperties & Record<`--${string}`, string | number>;

// JSX type declarations for Material Web custom elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
        type?: string;
        style?: StyleWithTokens;
      };
      'md-outlined-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
        type?: string;
        style?: StyleWithTokens;
      };
      'md-text-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
        type?: string;
        style?: StyleWithTokens;
      };
      'md-outlined-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        placeholder?: string;
        disabled?: boolean;
        readonly?: boolean;
        type?: string;
        rows?: number;
        style?: StyleWithTokens;
      };
      'md-outlined-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

// Size → CSS custom properties (per-variant names)
const SIZE_TOKENS: Record<NonNullable<ButtonProps['size']>, StyleWithTokens> = {
  sm: {
    '--md-filled-button-container-height': '32px',
    '--md-outlined-button-container-height': '32px',
    '--md-text-button-container-height': '32px',
    fontSize: '12px',
  },
  md: {},
  lg: {
    '--md-filled-button-container-height': '48px',
    '--md-outlined-button-container-height': '48px',
    '--md-text-button-container-height': '48px',
    fontSize: '16px',
  },
};

// Filled-button color overrides per semantic variant
const FILLED_COLOR_TOKENS: Record<'primary' | 'secondary' | 'danger', StyleWithTokens> = {
  primary: {
    '--md-filled-button-container-color': '#10b981',
    '--md-filled-button-hover-state-layer-color': '#059669',
    '--md-filled-button-label-text-color': '#fff',
    '--md-filled-button-hover-label-text-color': '#fff',
  },
  secondary: {
    '--md-filled-button-container-color': '#8b5cf6',
    '--md-filled-button-hover-state-layer-color': '#7c3aed',
    '--md-filled-button-label-text-color': '#fff',
    '--md-filled-button-hover-label-text-color': '#fff',
  },
  danger: {
    '--md-filled-button-container-color': '#ef4444',
    '--md-filled-button-hover-state-layer-color': '#dc2626',
    '--md-filled-button-label-text-color': '#fff',
    '--md-filled-button-hover-label-text-color': '#fff',
  },
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  className = '',
  style,
  disabled,
  type = 'button',
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  title,
  tabIndex,
}) => {
  const content = (
    <>
      {isLoading
        ? <Loader2 className="w-4 h-4 animate-spin" style={{ marginRight: '0.5rem' }} />
        : icon && <span style={{ marginRight: '0.5rem', display: 'inline-flex', alignItems: 'center' }}>{icon}</span>
      }
      {children}
    </>
  );

  const isDisabled = isLoading || disabled || undefined;
  const sizeStyle = SIZE_TOKENS[size];

  const commonProps = {
    disabled: isDisabled,
    type,
    className,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    title,
    tabIndex,
  };

  if (variant === 'outline') {
    return (
      <md-outlined-button {...commonProps} style={{ ...sizeStyle, ...style }}>
        {content}
      </md-outlined-button>
    );
  }

  if (variant === 'ghost') {
    return (
      <md-text-button {...commonProps} style={{ ...sizeStyle, ...style }}>
        {content}
      </md-text-button>
    );
  }

  // primary | secondary | danger → filled button with color tokens
  return (
    <md-filled-button
      {...commonProps}
      style={{ ...sizeStyle, ...FILLED_COLOR_TOKENS[variant as 'primary' | 'secondary' | 'danger'], ...style }}
    >
      {content}
    </md-filled-button>
  );
};

// --- Card ---
// md-outlined-card wraps the content; CardHeader/CardContent remain as divs
// since Material Web cards have no header/content slot conventions.
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <md-outlined-card className={`overflow-hidden ${className}`} style={{ display: 'block', width: '100%' }}>
    {children}
  </md-outlined-card>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-border ${className}`}>{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

// --- Inputs ---
// md-outlined-text-field is a web component: React's onChange and controlled
// value don't work natively. We bridge both via useRef + native event listeners.

type MdTextField = HTMLElement & { value: string };

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', value, onChange, placeholder, disabled, readOnly }) => {
  const ref = useRef<MdTextField>(null);

  // Sync controlled value imperatively (attribute vs property differ in web components)
  useEffect(() => {
    if (ref.current) {
      ref.current.value = String(value ?? '');
    }
  }, [value]);

  // Bridge native 'input' event → React onChange signature
  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;
    const handler = (e: Event) => onChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [onChange]);

  return (
    <md-outlined-text-field
      ref={ref as React.Ref<HTMLElement>}
      label={label}
      placeholder={placeholder}
      disabled={disabled || undefined}
      readonly={readOnly || undefined}
      className={className}
      style={{ width: '100%' }}
    />
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, className = '', value, onChange, placeholder, disabled, readOnly, rows }) => {
  const ref = useRef<MdTextField>(null);

  // Sync controlled value imperatively
  useEffect(() => {
    if (ref.current) {
      ref.current.value = String(value ?? '');
    }
  }, [value]);

  // Bridge native 'input' event → React onChange signature
  useEffect(() => {
    const el = ref.current;
    if (!el || !onChange) return;
    const handler = (e: Event) => onChange(e as unknown as React.ChangeEvent<HTMLTextAreaElement>);
    el.addEventListener('input', handler);
    return () => el.removeEventListener('input', handler);
  }, [onChange]);

  return (
    <md-outlined-text-field
      ref={ref as React.Ref<HTMLElement>}
      type="textarea"
      label={label}
      placeholder={placeholder}
      disabled={disabled || undefined}
      readonly={readOnly || undefined}
      rows={rows}
      className={className}
      style={{ width: '100%', minHeight: '120px' }}
    />
  );
};

// --- Badge (kept custom — no stable Material Web equivalent) ---
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: "bg-slate-700 text-slate-200",
    success: "bg-emerald-900/30 text-emerald-400 border border-emerald-900",
    warning: "bg-amber-900/30 text-amber-400 border border-amber-900",
    danger: "bg-red-900/30 text-red-400 border border-red-900",
    info: "bg-blue-900/30 text-blue-400 border border-blue-900",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};
