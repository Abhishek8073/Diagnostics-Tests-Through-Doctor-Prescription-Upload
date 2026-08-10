import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

const styles = {
  success: { bg: 'bg-emerald-600', icon: '✓' },
  error: { bg: 'bg-rose-600', icon: '✕' },
  info: { bg: 'bg-slate-800', icon: 'ℹ' }
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'success', duration = 3500) => {
      const id = ++idRef.current
      setToasts((current) => [...current, { id, message, type }])
      window.setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        {toasts.map((toast) => {
          const style = styles[toast.type] || styles.info
          return (
            <div
              key={toast.id}
              className={`animate-reveal-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${style.bg}`}
              role="status"
            >
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs">
                {style.icon}
              </span>
              <span className="flex-1 leading-snug">{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                className="ml-1 text-white/70 hover:text-white"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const showToast = useContext(ToastContext)
  if (!showToast) {
    throw new Error('useToast must be used inside a ToastProvider')
  }
  return showToast
}
