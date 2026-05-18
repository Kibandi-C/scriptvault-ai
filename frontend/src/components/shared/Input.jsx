import { useState } from 'react'

const baseInput = `
  w-full bg-elevated border border-[rgba(255,255,255,0.06)] rounded-md
  text-[#F0F0F0] placeholder-[#4A4A4A] text-sm px-4 py-3 outline-none
  transition-all duration-150
  focus:border-green focus:shadow-green-glow
`

function toId(label) {
  return label ? label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : undefined
}

export function Input({ label, error, className = '', type, ...props }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputId = props.id ?? toId(label)
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wider uppercase text-[#9A9A9A]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          className={`${baseInput} ${error ? 'border-[#FF453A]' : ''} ${isPassword ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A4A4A] hover:text-[#9A9A9A] transition-colors text-xs select-none"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-[#FF453A]" role="alert">{error}</span>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  const inputId = props.id ?? toId(label)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wider uppercase text-[#9A9A9A]"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`${baseInput} resize-none ${error ? 'border-[#FF453A]' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#FF453A]" role="alert">{error}</span>}
    </div>
  )
}
