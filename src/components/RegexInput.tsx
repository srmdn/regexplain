interface Props {
  value: string
  onChange: (v: string) => void
}

const EXAMPLES = [
  { label: 'Email',    value: '/^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$/i' },
  { label: 'URL',      value: '/https?:\\/\\/[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:/?#[\\]@!$&\'()*+,;=]*/i' },
  { label: 'Password', value: '/^(?=.*[A-Z])(?=.*\\d).{8,}$/' },
  { label: 'Date',     value: '/^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$/' },
  { label: 'Hex color',value: '/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/' },
]

export default function RegexInput({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="/your-regex-here/flags"
          spellCheck={false}
          className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-4 text-base font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
          autoFocus
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-xs text-zinc-600">Examples:</span>
        {EXAMPLES.map(ex => (
          <button
            key={ex.label}
            onClick={() => onChange(ex.value)}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  )
}
