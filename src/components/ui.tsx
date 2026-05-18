import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit'
}

export function Button({
  children, onClick, variant = 'primary',
  disabled, loading, fullWidth, type = 'button'
}: ButtonProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--gold)',
      color: 'var(--navy)',
      border: 'none',
      fontWeight: 600,
    },
    secondary: {
      background: 'transparent',
      color: 'var(--cream)',
      border: '1px solid var(--border)',
      fontWeight: 400,
    },
    ghost: {
      background: 'transparent',
      color: 'var(--muted)',
      border: 'none',
      fontWeight: 400,
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...styles[variant],
        padding: '12px 24px',
        borderRadius: 'var(--radius)',
        fontSize: 14,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: 'var(--font-body)',
      }}
    >
      {loading ? <Spinner /> : children}
    </button>
  )
}

export function Spinner() {
  return (
    <span style={{
      width: 16,
      height: 16,
      border: '2px solid currentColor',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'spin 0.7s linear infinite',
    }} />
  )
}

interface InputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  hint?: string
  error?: string
}

export function Input({ label, value, onChange, placeholder, type = 'text', hint, error }: InputProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--cream)', marginBottom: 6 }}>
        {label}
      </label>
      {hint && <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>{hint}</p>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '11px 14px',
          background: 'var(--navy-soft)',
          border: `1px solid ${error ? '#e24b4a' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          color: 'var(--cream)',
          fontSize: 14,
          transition: 'border 0.2s',
        }}
      />
      {error && <p style={{ fontSize: 11, color: '#e24b4a', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

interface CardProps {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ children, selected, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? 'rgba(201,151,60,0.12)' : 'var(--navy-soft)',
        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '16px 20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function StepHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--cream)', lineHeight: 1.2 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6, lineHeight: 1.5 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

export function NavButtons({
  onBack, onNext, nextLabel = 'Continuar →', disabled, loading
}: {
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  disabled?: boolean
  loading?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between' }}>
      {onBack ? (
        <Button variant="secondary" onClick={onBack}>← Voltar</Button>
      ) : <span />}
      {onNext && (
        <Button onClick={onNext} disabled={disabled} loading={loading}>
          {nextLabel}
        </Button>
      )}
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div style={{
      background: 'rgba(226,75,74,0.1)',
      border: '1px solid rgba(226,75,74,0.4)',
      borderRadius: 'var(--radius)',
      padding: '12px 16px',
      color: '#f09595',
      fontSize: 13,
      marginBottom: 16,
    }}>
      ⚠️ {message}
    </div>
  )
}
