export function Button({ variant = 'primary', size = 'md', type = 'button', children, className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/40'

  const variants = {
    primary:
      'bg-green text-[#050505] hover:bg-green-dim active:scale-[0.97]',
    secondary:
      'bg-blue text-white hover:bg-blue-dim active:scale-[0.97]',
    ghost:
      'bg-transparent border border-[rgba(255,255,255,0.10)] text-[#F0F0F0] hover:border-green hover:text-green active:scale-[0.97]',
    danger:
      'bg-transparent border border-[rgba(255,82,58,0.35)] text-[#FF453A] hover:border-[#FF453A] active:scale-[0.97]',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 tracking-wide',
    md: 'text-sm px-5 py-2.5 tracking-wide',
    lg: 'text-base px-6 py-3 tracking-wide',
  }

  return (
    <button
      type={type}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
