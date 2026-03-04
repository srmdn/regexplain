export type TokenType =
  | 'literal'
  | 'anchor-start'
  | 'anchor-end'
  | 'dot'
  | 'quantifier'
  | 'group-open'
  | 'group-close'
  | 'lookahead-open'
  | 'lookbehind-open'
  | 'negative-lookahead-open'
  | 'negative-lookbehind-open'
  | 'char-class-open'
  | 'char-class-close'
  | 'char-class-content'
  | 'alternation'
  | 'escape'
  | 'flag'

export interface Token {
  type: TokenType
  value: string
  explanation: string
  color: string
}

const COLORS = [
  { bg: 'bg-violet-500/20', text: 'text-violet-300', border: 'border-violet-500/40' },
  { bg: 'bg-blue-500/20',   text: 'text-blue-300',   border: 'border-blue-500/40'   },
  { bg: 'bg-emerald-500/20',text: 'text-emerald-300',border: 'border-emerald-500/40'},
  { bg: 'bg-yellow-500/20', text: 'text-yellow-300', border: 'border-yellow-500/40' },
  { bg: 'bg-pink-500/20',   text: 'text-pink-300',   border: 'border-pink-500/40'   },
  { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
  { bg: 'bg-cyan-500/20',   text: 'text-cyan-300',   border: 'border-cyan-500/40'   },
  { bg: 'bg-red-500/20',    text: 'text-red-300',    border: 'border-red-500/40'    },
]

export interface ParsedToken {
  value: string
  explanation: string
  colorIndex: number
}

export interface ParseResult {
  tokens: ParsedToken[]
  flags: string
  flagExplanations: { flag: string; explanation: string }[]
  isValid: boolean
  error?: string
}

function explainEscape(char: string): string {
  const map: Record<string, string> = {
    d: 'Any digit (0–9)',
    D: 'Any non-digit',
    w: 'Any word character (a–z, A–Z, 0–9, _)',
    W: 'Any non-word character',
    s: 'Any whitespace (space, tab, newline)',
    S: 'Any non-whitespace',
    b: 'Word boundary',
    B: 'Non-word boundary',
    n: 'Newline',
    r: 'Carriage return',
    t: 'Tab',
    '.': 'Literal dot',
    '(': 'Literal opening parenthesis',
    ')': 'Literal closing parenthesis',
    '[': 'Literal opening bracket',
    ']': 'Literal closing bracket',
    '{': 'Literal opening brace',
    '}': 'Literal closing brace',
    '*': 'Literal asterisk',
    '+': 'Literal plus',
    '?': 'Literal question mark',
    '^': 'Literal caret',
    '$': 'Literal dollar sign',
    '|': 'Literal pipe',
    '\\': 'Literal backslash',
  }
  return map[char] ?? `Escaped character: "${char}"`
}

function explainQuantifier(q: string): string {
  if (q === '*') return 'Zero or more times (greedy)'
  if (q === '+') return 'One or more times (greedy)'
  if (q === '?') return 'Zero or one time (optional)'
  if (q === '*?') return 'Zero or more times (lazy)'
  if (q === '+?') return 'One or more times (lazy)'
  if (q === '??') return 'Zero or one time (lazy)'
  const exact = q.match(/^\{(\d+)\}$/)
  if (exact) return `Exactly ${exact[1]} times`
  const range = q.match(/^\{(\d+),(\d+)\}$/)
  if (range) return `Between ${range[1]} and ${range[2]} times`
  const min = q.match(/^\{(\d+),\}$/)
  if (min) return `At least ${min[1]} times`
  return `Quantifier: ${q}`
}

function explainFlag(flag: string): string {
  const map: Record<string, string> = {
    g: 'Global — find all matches, not just the first',
    i: 'Case-insensitive — match regardless of case',
    m: 'Multiline — ^ and $ match start/end of each line',
    s: 'Dotall — dot (.) also matches newlines',
    u: 'Unicode — enable full Unicode support',
    y: 'Sticky — match only from the current position',
    d: 'Indices — provide start/end indices for matches',
  }
  return map[flag] ?? `Flag: ${flag}`
}

export function parseRegex(input: string): ParseResult {
  // Strip surrounding slashes and extract flags
  let pattern = input.trim()
  let flags = ''

  if (pattern.startsWith('/')) {
    const lastSlash = pattern.lastIndexOf('/')
    if (lastSlash > 0) {
      flags = pattern.slice(lastSlash + 1)
      pattern = pattern.slice(1, lastSlash)
    } else {
      pattern = pattern.slice(1)
    }
  }

  // Validate
  try {
    new RegExp(pattern, flags)
  } catch (e) {
    return { tokens: [], flags, flagExplanations: [], isValid: false, error: (e as Error).message }
  }

  const tokens: ParsedToken[] = []
  let i = 0
  let colorIndex = 0
  let groupDepth = 0

  while (i < pattern.length) {
    const ch = pattern[i]

    // Lookahead / lookbehind / non-capturing groups
    if (ch === '(' ) {
      let value = '('
      let explanation = 'Start of capturing group'

      if (pattern[i + 1] === '?') {
        if (pattern[i + 2] === ':') {
          value = '(?:'
          explanation = 'Start of non-capturing group'
          i += 3
        } else if (pattern[i + 2] === '=' ) {
          value = '(?='
          explanation = 'Start of positive lookahead — asserts what follows'
          i += 3
        } else if (pattern[i + 2] === '!') {
          value = '(?!'
          explanation = 'Start of negative lookahead — asserts what does NOT follow'
          i += 3
        } else if (pattern[i + 2] === '<' && pattern[i + 3] === '=') {
          value = '(?<='
          explanation = 'Start of positive lookbehind — asserts what precedes'
          i += 4
        } else if (pattern[i + 2] === '<' && pattern[i + 3] === '!') {
          value = '(?<!'
          explanation = 'Start of negative lookbehind — asserts what does NOT precede'
          i += 4
        } else {
          i += 1
        }
      } else {
        groupDepth++
        i += 1
      }

      tokens.push({ value, explanation, colorIndex: colorIndex % COLORS.length })
      colorIndex++
      continue
    }

    if (ch === ')') {
      tokens.push({ value: ')', explanation: 'End of group', colorIndex: Math.max(0, (colorIndex - 1)) % COLORS.length })
      if (groupDepth > 0) groupDepth--
      i++
      continue
    }

    // Character class
    if (ch === '[') {
      let value = '['
      let j = i + 1
      const negated = pattern[j] === '^'
      if (negated) { value += '^'; j++ }
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\') { value += pattern[j] + pattern[j + 1]; j += 2 }
        else { value += pattern[j]; j++ }
      }
      value += ']'
      const inner = negated ? value.slice(2, -1) : value.slice(1, -1)
      const explanation = negated
        ? `Any character NOT in: ${inner}`
        : `Any one character from: ${inner}`
      tokens.push({ value, explanation, colorIndex: colorIndex % COLORS.length })
      colorIndex++
      i = j + 1
      continue
    }

    // Anchors
    if (ch === '^') {
      tokens.push({ value: '^', explanation: 'Start of string (or line in multiline mode)', colorIndex: colorIndex % COLORS.length })
      colorIndex++; i++; continue
    }
    if (ch === '$') {
      tokens.push({ value: '$', explanation: 'End of string (or line in multiline mode)', colorIndex: colorIndex % COLORS.length })
      colorIndex++; i++; continue
    }

    // Dot
    if (ch === '.') {
      tokens.push({ value: '.', explanation: 'Any single character except newline', colorIndex: colorIndex % COLORS.length })
      colorIndex++; i++; continue
    }

    // Alternation
    if (ch === '|') {
      tokens.push({ value: '|', explanation: 'Or — match either the left or right expression', colorIndex: colorIndex % COLORS.length })
      colorIndex++; i++; continue
    }

    // Escape sequences
    if (ch === '\\') {
      const next = pattern[i + 1] ?? ''
      const value = '\\' + next
      tokens.push({ value, explanation: explainEscape(next), colorIndex: colorIndex % COLORS.length })
      colorIndex++; i += 2; continue
    }

    // Quantifiers
    if ('*+?'.includes(ch)) {
      const lazy = pattern[i + 1] === '?'
      const value = ch + (lazy ? '?' : '')
      tokens.push({ value, explanation: explainQuantifier(value), colorIndex: colorIndex % COLORS.length })
      colorIndex++; i += lazy ? 2 : 1; continue
    }

    if (ch === '{') {
      let j = i + 1
      while (j < pattern.length && pattern[j] !== '}') j++
      const value = pattern.slice(i, j + 1)
      const lazy = pattern[j + 1] === '?'
      const fullValue = value + (lazy ? '?' : '')
      tokens.push({ value: fullValue, explanation: explainQuantifier(fullValue), colorIndex: colorIndex % COLORS.length })
      colorIndex++; i = j + 1 + (lazy ? 1 : 0); continue
    }

    // Literal characters
    tokens.push({ value: ch, explanation: `Matches the literal character "${ch}"`, colorIndex: colorIndex % COLORS.length })
    colorIndex++; i++
  }

  const flagExplanations = flags.split('').map(f => ({ flag: f, explanation: explainFlag(f) }))

  return { tokens, flags, flagExplanations, isValid: true }
}

export function getColor(index: number) {
  return COLORS[index % COLORS.length]
}
