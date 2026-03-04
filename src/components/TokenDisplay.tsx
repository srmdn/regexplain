import { parseRegex, getColor } from '../utils/parser'

interface Props {
  input: string
}

export default function TokenDisplay({ input }: Props) {
  const result = parseRegex(input)

  if (!input.trim()) return null

  if (!result.isValid) {
    return (
      <div className="bg-red-950 border border-red-900 text-red-400 rounded-2xl px-5 py-4 text-sm font-mono">
        Invalid regex: {result.error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Highlighted regex */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">Pattern</p>
        <div className="flex flex-wrap gap-1 font-mono text-base">
          {result.tokens.map((token, i) => {
            const color = getColor(token.colorIndex)
            return (
              <span
                key={i}
                title={token.explanation}
                className={`inline-block px-1.5 py-0.5 rounded-md border text-sm ${color.bg} ${color.text} ${color.border} cursor-default`}
              >
                {token.value}
              </span>
            )
          })}
          {result.flags && (
            <span className="inline-block px-1.5 py-0.5 rounded-md border text-sm bg-zinc-800 text-zinc-400 border-zinc-700 ml-1">
              /{result.flags}
            </span>
          )}
        </div>
      </div>

      {/* Token breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">Breakdown</p>
        <div className="space-y-2">
          {result.tokens.map((token, i) => {
            const color = getColor(token.colorIndex)
            return (
              <div key={i} className="flex items-start gap-3">
                <span className={`shrink-0 font-mono text-sm px-2 py-0.5 rounded-md border min-w-[3rem] text-center ${color.bg} ${color.text} ${color.border}`}>
                  {token.value}
                </span>
                <span className="text-sm text-zinc-400 pt-0.5">{token.explanation}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Flags */}
      {result.flagExplanations.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-xs text-zinc-600 uppercase tracking-widest mb-4">Flags</p>
          <div className="space-y-2">
            {result.flagExplanations.map(({ flag, explanation }) => (
              <div key={flag} className="flex items-start gap-3">
                <span className="shrink-0 font-mono text-sm px-2 py-0.5 rounded-md border bg-zinc-800 text-zinc-300 border-zinc-700 min-w-[3rem] text-center">
                  {flag}
                </span>
                <span className="text-sm text-zinc-400 pt-0.5">{explanation}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
