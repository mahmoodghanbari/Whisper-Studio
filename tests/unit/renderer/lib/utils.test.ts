import { describe, it, expect } from 'vitest'
import { formatBytes, secondsToDisplay, escapeRegex } from '@/lib/utils'

describe('formatBytes()', () => {
  it('returns "0 B" for zero', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('returns "0 B" for negative numbers', () => {
    expect(formatBytes(-100)).toBe('0 B')
  })

  it('formats bytes under 1 KB', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(1)).toBe('1 B')
  })

  it('formats exactly 1 KB', () => {
    expect(formatBytes(1024)).toBe('1.0 KB')
  })

  it('formats KB with one decimal when value < 10', () => {
    expect(formatBytes(1024 * 2.5)).toBe('2.5 KB')
  })

  it('rounds KB when value >= 10', () => {
    expect(formatBytes(1024 * 15)).toBe('15 KB')
  })

  it('formats MB correctly', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB')
    expect(formatBytes(1024 * 1024 * 50)).toBe('50 MB')
  })

  it('formats GB correctly', () => {
    expect(formatBytes(1024 ** 3)).toBe('1.0 GB')
  })

  it('formats TB correctly', () => {
    expect(formatBytes(1024 ** 4)).toBe('1.0 TB')
  })

  it('caps at TB for very large values', () => {
    // 2048 TB — still shows TB
    expect(formatBytes(1024 ** 4 * 2048)).toMatch(/TB$/)
  })
})

describe('secondsToDisplay()', () => {
  it('returns "0:00" for zero', () => {
    expect(secondsToDisplay(0)).toBe('0:00')
  })

  it('returns "0:00" for NaN', () => {
    expect(secondsToDisplay(NaN)).toBe('0:00')
  })

  it('formats seconds under a minute as "m:ss"', () => {
    expect(secondsToDisplay(45)).toBe('0:45')
    expect(secondsToDisplay(9)).toBe('0:09')
  })

  it('formats exactly one minute', () => {
    expect(secondsToDisplay(60)).toBe('1:00')
  })

  it('formats minutes and seconds', () => {
    expect(secondsToDisplay(90)).toBe('1:30')
    expect(secondsToDisplay(599)).toBe('9:59')
  })

  it('formats hours when >= 3600 seconds as "h:mm:ss"', () => {
    expect(secondsToDisplay(3600)).toBe('1:00:00')
    expect(secondsToDisplay(3661)).toBe('1:01:01')
    expect(secondsToDisplay(7384)).toBe('2:03:04')
  })

  it('pads minutes and seconds with leading zeros', () => {
    expect(secondsToDisplay(3600 + 60 + 5)).toBe('1:01:05')
  })

  it('truncates fractional seconds', () => {
    expect(secondsToDisplay(90.9)).toBe('1:30')
  })
})

describe('escapeRegex()', () => {
  it('returns plain strings unchanged', () => {
    expect(escapeRegex('hello world')).toBe('hello world')
  })

  it('escapes dot', () => {
    expect(escapeRegex('.')).toBe('\\.')
  })

  it('escapes all special regex characters', () => {
    const specials = ['.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '\\']
    for (const char of specials) {
      expect(escapeRegex(char)).toBe(`\\${char}`)
    }
  })

  it('escapes mixed strings correctly', () => {
    expect(escapeRegex('hello.world')).toBe('hello\\.world')
    expect(escapeRegex('(test)')).toBe('\\(test\\)')
    expect(escapeRegex('$10.00')).toBe('\\$10\\.00')
  })

  it('produces a string that works in new RegExp() without errors', () => {
    const dangerous = '.*+?^${}()|[]\\special[chars]'
    expect(() => new RegExp(escapeRegex(dangerous))).not.toThrow()
  })

  it('returns empty string unchanged', () => {
    expect(escapeRegex('')).toBe('')
  })
})
