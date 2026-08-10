export default function EmptyState({ title = 'Nothing here yet', body, icon = '📄' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden="true">{icon}</span>
      <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
      {body ? <p className="mt-1 max-w-xs text-sm text-slate-500">{body}</p> : null}
    </div>
  )
}
