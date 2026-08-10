import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null)
  const resolverRef = useRef(null)

  const confirm = useCallback((options) => {
    const config = typeof options === 'string' ? { message: options } : options

    return new Promise((resolve) => {
      resolverRef.current = resolve
      setState({
        title: config.title || 'Are you sure?',
        message: config.message,
        confirmLabel: config.confirmLabel || 'Confirm',
        cancelLabel: config.cancelLabel || 'Cancel',
        danger: config.danger !== false
      })
    })
  }, [])

  const handleClose = (result) => {
    setState(null)
    resolverRef.current?.(result)
    resolverRef.current = null
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="animate-reveal-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">{state.title}</h3>
            {state.message ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{state.message}</p> : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => handleClose(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${
                  state.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-brand-600 hover:bg-brand-700'
                }`}
                autoFocus
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext)
  if (!confirm) {
    throw new Error('useConfirm must be used inside a ConfirmProvider')
  }
  return confirm
}
