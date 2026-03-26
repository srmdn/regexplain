import { describe, it, expect } from 'vitest'
import { parseRegex } from './parser'

describe('parseRegex', () => {
  it('parses empty input as valid with no tokens', () => {
    const result = parseRegex('')
    expect(result.isValid).toBe(true)
    expect(result.tokens).toHaveLength(0)
  })

  it('marks an invalid regex as invalid with an error', () => {
    const result = parseRegex('[unclosed')
    expect(result.isValid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('parses a simple literal', () => {
    const result = parseRegex('abc')
    expect(result.isValid).toBe(true)
    expect(result.tokens).toHaveLength(3)
    expect(result.tokens[0].value).toBe('a')
    expect(result.tokens[0].explanation).toContain('"a"')
  })

  it('parses start and end anchors', () => {
    const result = parseRegex('^hello$')
    expect(result.isValid).toBe(true)
    const values = result.tokens.map(t => t.value)
    expect(values).toContain('^')
    expect(values).toContain('$')
    const caret = result.tokens.find(t => t.value === '^')
    expect(caret!.explanation.toLowerCase()).toContain('start')
    const dollar = result.tokens.find(t => t.value === '$')
    expect(dollar!.explanation.toLowerCase()).toContain('end')
  })

  it('parses dot', () => {
    const result = parseRegex('a.b')
    expect(result.isValid).toBe(true)
    const dot = result.tokens.find(t => t.value === '.')
    expect(dot).toBeDefined()
    expect(dot!.explanation.toLowerCase()).toContain('any')
  })

  it('parses quantifiers', () => {
    const cases: [string, string][] = [
      ['a*', 'Zero or more'],
      ['a+', 'One or more'],
      ['a?', 'Zero or one'],
    ]
    for (const [pattern, expected] of cases) {
      const result = parseRegex(pattern)
      expect(result.isValid).toBe(true)
      const q = result.tokens.find(t => ['*', '+', '?'].includes(t.value))
      expect(q!.explanation).toContain(expected)
    }
  })

  it('parses exact quantifier {n}', () => {
    const result = parseRegex('a{3}')
    expect(result.isValid).toBe(true)
    const q = result.tokens.find(t => t.value === '{3}')
    expect(q!.explanation).toContain('Exactly 3')
  })

  it('parses range quantifier {n,m}', () => {
    const result = parseRegex('a{2,5}')
    expect(result.isValid).toBe(true)
    const q = result.tokens.find(t => t.value === '{2,5}')
    expect(q!.explanation).toContain('Between 2 and 5')
  })

  it('parses capturing group', () => {
    const result = parseRegex('(abc)')
    expect(result.isValid).toBe(true)
    const open = result.tokens.find(t => t.value === '(')
    expect(open!.explanation.toLowerCase()).toContain('capturing group')
  })

  it('parses non-capturing group', () => {
    const result = parseRegex('(?:abc)')
    expect(result.isValid).toBe(true)
    const open = result.tokens.find(t => t.value === '(?:')
    expect(open!.explanation.toLowerCase()).toContain('non-capturing')
  })

  it('parses positive lookahead', () => {
    const result = parseRegex('foo(?=bar)')
    expect(result.isValid).toBe(true)
    const la = result.tokens.find(t => t.value === '(?=')
    expect(la!.explanation.toLowerCase()).toContain('lookahead')
  })

  it('parses negative lookahead', () => {
    const result = parseRegex('foo(?!bar)')
    expect(result.isValid).toBe(true)
    const la = result.tokens.find(t => t.value === '(?!')
    expect(la!.explanation.toLowerCase()).toContain('negative lookahead')
  })

  it('parses character class', () => {
    const result = parseRegex('[a-z]')
    expect(result.isValid).toBe(true)
    const cc = result.tokens.find(t => t.value === '[a-z]')
    expect(cc!.explanation.toLowerCase()).toContain('any one character')
  })

  it('parses negated character class', () => {
    const result = parseRegex('[^0-9]')
    expect(result.isValid).toBe(true)
    const cc = result.tokens.find(t => t.value.startsWith('[^'))
    expect(cc!.explanation.toLowerCase()).toContain('not')
  })

  it('parses escape sequences', () => {
    const escapes: [string, string][] = [
      ['\\d', 'digit'],
      ['\\w', 'word'],
      ['\\s', 'whitespace'],
    ]
    for (const [pattern, expected] of escapes) {
      const result = parseRegex(pattern)
      expect(result.isValid).toBe(true)
      const token = result.tokens.find(t => t.value === pattern)
      expect(token!.explanation.toLowerCase()).toContain(expected)
    }
  })

  it('parses alternation', () => {
    const result = parseRegex('cat|dog')
    expect(result.isValid).toBe(true)
    const pipe = result.tokens.find(t => t.value === '|')
    expect(pipe!.explanation.toLowerCase()).toContain('or')
  })

  it('strips surrounding slashes and extracts flags', () => {
    const result = parseRegex('/hello/gi')
    expect(result.isValid).toBe(true)
    expect(result.flags).toBe('gi')
    expect(result.flagExplanations).toHaveLength(2)
    expect(result.flagExplanations.find(f => f.flag === 'g')).toBeDefined()
    expect(result.flagExplanations.find(f => f.flag === 'i')).toBeDefined()
  })

  it('explains known flags correctly', () => {
    const result = parseRegex('/abc/gims')
    expect(result.isValid).toBe(true)
    const g = result.flagExplanations.find(f => f.flag === 'g')
    expect(g!.explanation.toLowerCase()).toContain('global')
    const i = result.flagExplanations.find(f => f.flag === 'i')
    expect(i!.explanation.toLowerCase()).toContain('case')
  })
})
