import { useEffect } from 'react'
import { useUIStore } from '../../store'

const STYLES = {
  success: { border: 'border-l-green', dot: 'bg-green' },
  error:   { border: 'border-l-[#FF453A]', dot: 'bg-[#FF453A]' },
  info:    { border: 'border-l-blue', dot: 'bg-blue' },
  warning: { border: 'border-l-[#FFD60A]', dot: 'bg-[#FFD60A]' },
}

function Toast({ id, type = 'info', message }) {
  const removeToast = useUIStore((s) => s.removeToast)

  useEffect(() => {
    const t = setTimeout(() => removeToast(id), 4000)
    return () => clearTimeout(t)
  }, [id, removeToast])

  const s = STYLES[type] ?? STYLES.info

  return (
    <div
      role="status"
      aria-live="polite"
      className={`glass-card fade-in flex items-center gap-3 px-4 py-3 border-l-2 ${s.border} min-w-[280px]`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} aria-hidden="true" />
      <span className="text-sm text-[#F0F0F0] flex-1">{message}</span>
      <button
        onClick={() => removeToast(id)}
        aria-label="Dismiss notification"
        className="text-[#4A4A4A] hover:text-[#9A9A9A] transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2" aria-label="Notifications">
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  )
}
