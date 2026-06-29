import { describe, it, expect } from 'vitest'
import { parseSrt } from '@/lib/srt-parser'

const SIMPLE_SRT = `1
00:00:00,000 --> 00:00:02,500
Hello world

2
00:00:02,500 --> 00:00:05,000
Second line
`

describe('parseSrt()', () => {
  describe('basic parsing', () => {
    it('returns the correct number of segments', () => {
      expect(parseSrt(SIMPLE_SRT)).toHaveLength(2)
    })

    it('parses segment ids', () => {
      const segs = parseSrt(SIMPLE_SRT)
      expect(segs[0].id).toBe(1)
      expect(segs[1].id).toBe(2)
    })

    it('parses start and end seconds', () => {
      const segs = parseSrt(SIMPLE_SRT)
      expect(segs[0].startSeconds).toBe(0)
      expect(segs[0].endSeconds).toBe(2.5)
      expect(segs[1].startSeconds).toBe(2.5)
      expect(segs[1].endSeconds).toBe(5)
    })

    it('parses segment text', () => {
      const segs = parseSrt(SIMPLE_SRT)
      expect(segs[0].text).toBe('Hello world')
      expect(segs[1].text).toBe('Second line')
    })

    it('sets speaker and name to empty string', () => {
      const seg = parseSrt(SIMPLE_SRT)[0]
      expect(seg.speaker).toBe('')
      expect(seg.name).toBe('')
    })

    it('sets display time strings', () => {
      const seg = parseSrt(SIMPLE_SRT)[0]
      expect(seg.time).toBe('0:00')
      expect(seg.endTime).toBe('0:02')
    })
  })

  describe('timestamp formats', () => {
    it('accepts comma millisecond separator (standard SRT)', () => {
      const srt = `1\n00:00:01,500 --> 00:00:03,000\nTest\n`
      const [seg] = parseSrt(srt)
      expect(seg.startSeconds).toBe(1.5)
      expect(seg.endSeconds).toBe(3)
    })

    it('accepts dot millisecond separator (VTT-style)', () => {
      const srt = `1\n00:00:01.500 --> 00:00:03.000\nTest\n`
      const [seg] = parseSrt(srt)
      expect(seg.startSeconds).toBe(1.5)
    })

    it('handles hours correctly', () => {
      const srt = `1\n01:02:03,000 --> 01:02:05,000\nHours\n`
      const [seg] = parseSrt(srt)
      expect(seg.startSeconds).toBe(3600 + 120 + 3)
      expect(seg.time).toBe('1:02:03')
    })

    it('parses sub-second precision', () => {
      const srt = `1\n00:00:00,001 --> 00:00:00,999\nPrecise\n`
      const [seg] = parseSrt(srt)
      expect(seg.startSeconds).toBeCloseTo(0.001)
      expect(seg.endSeconds).toBeCloseTo(0.999)
    })
  })

  describe('multi-line text', () => {
    it('joins multi-line text with a space', () => {
      const srt = `1\n00:00:00,000 --> 00:00:02,000\nLine one\nLine two\n`
      const [seg] = parseSrt(srt)
      expect(seg.text).toBe('Line one Line two')
    })
  })

  describe('line endings', () => {
    it('handles CRLF line endings', () => {
      const srt = `1\r\n00:00:00,000 --> 00:00:02,000\r\nHello\r\n\r\n2\r\n00:00:02,000 --> 00:00:04,000\r\nWorld\r\n`
      expect(parseSrt(srt)).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('returns empty array for empty string', () => {
      expect(parseSrt('')).toHaveLength(0)
    })

    it('skips blocks with fewer than 3 lines', () => {
      const srt = `1\n00:00:00,000 --> 00:00:02,000\n`
      expect(parseSrt(srt)).toHaveLength(0)
    })

    it('skips blocks with invalid id', () => {
      const srt = `notAnId\n00:00:00,000 --> 00:00:02,000\nText\n`
      expect(parseSrt(srt)).toHaveLength(0)
    })

    it('skips blocks with malformed timecodes', () => {
      const srt = `1\nnot a timecode\nText\n`
      expect(parseSrt(srt)).toHaveLength(0)
    })

    it('handles extra blank lines between blocks', () => {
      const srt = `1\n00:00:00,000 --> 00:00:01,000\nA\n\n\n2\n00:00:01,000 --> 00:00:02,000\nB\n`
      expect(parseSrt(srt)).toHaveLength(2)
    })

    it('tolerates leading and trailing whitespace in the content', () => {
      expect(parseSrt(`\n${SIMPLE_SRT}\n`)).toHaveLength(2)
    })
  })
})
