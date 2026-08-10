export default function Spinner({ label, size = 'md', className = '' }) {
  const dimensions = size === 'sm' ? 'h-4 w-4 border-2' : size === 'lg' ? 'h-8 w-8 border-[3px]' : 'h-5 w-5 border-2'

  return (
    <div className={`flex items-center gap-2 text-slate-500 ${className}`}>
      <span
        className={`inline-block animate-spin rounded-full border-slate-300 border-t-brand-600 ${dimensions}`}
        aria-hidden="true"
      />
      {label ? <span className="text-sm">{label}</span> : null}
    </div>
  )
}
