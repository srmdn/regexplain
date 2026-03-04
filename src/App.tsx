import { useState } from 'react'
import RegexInput from './components/RegexInput'
import TokenDisplay from './components/TokenDisplay'

export default function App() {
  const [input, setInput] = useState('')

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-16">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">Regexplain</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Paste any regular expression — get it broken down in plain English.
          </p>
        </div>

        {/* Input */}
        <div className="mb-8">
          <RegexInput value={input} onChange={setInput} />
        </div>

        {/* Output */}
        <TokenDisplay input={input} />

        {/* Footer */}
        {!input && (
          <p className="text-zinc-700 text-xs text-center mt-20">
            Supports anchors, groups, lookaheads, character classes, quantifiers, escape sequences, and flags.
          </p>
        )}

        <p className="text-center text-zinc-700 text-xs mt-10">
          Open source ·{' '}
          <a href="https://github.com/srmdn/regexplain" className="hover:text-zinc-500 transition-colors">
            github.com/srmdn/regexplain
          </a>
        </p>
      </div>
    </div>
  )
}
