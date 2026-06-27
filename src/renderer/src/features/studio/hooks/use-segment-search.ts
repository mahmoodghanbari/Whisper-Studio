import { useState, useMemo, useRef, useEffect } from 'react'
import type { SrtSegment } from '@/lib/srt-parser'
import { escapeRegex } from '@/lib/utils'

interface UseSegmentSearchOptions {
  onActivate: (id: number) => void
  onMutation: () => void
  segments: SrtSegment[]
  setSegments: React.Dispatch<React.SetStateAction<SrtSegment[]>>
}

interface UseSegmentSearchResult {
  filteredSegments: SrtSegment[]
  handleReplace: () => void
  handleReplaceAll: () => void
  matchCount: number
  replaceText: string
  searchQuery: string
  setReplaceText: React.Dispatch<React.SetStateAction<string>>
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>
  setShowReplace: React.Dispatch<React.SetStateAction<boolean>>
  showReplace: boolean
}

export function useSegmentSearch({
  segments,
  setSegments,
  onMutation,
  onActivate
}: UseSegmentSearchOptions): UseSegmentSearchResult {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [showReplace, setShowReplace] = useState(false)
  const replaceIndexRef = useRef(0)

  useEffect(() => {
    replaceIndexRef.current = 0
  }, [searchQuery])

  function handleReplace(): void {
    if (!searchQuery || !replaceText) return
    const lower = searchQuery.toLowerCase()
    const matching = segments.filter((s) => s.text.toLowerCase().includes(lower))
    if (matching.length === 0) return

    const idx = replaceIndexRef.current % matching.length
    const target = matching[idx]

    setSegments((segs) =>
      segs.map((s) =>
        s.id === target.id
          ? {
              ...s,
              text: s.text.replace(new RegExp(escapeRegex(searchQuery), 'i'), replaceText)
            }
          : s
      )
    )
    onActivate(target.id)
    onMutation()
    replaceIndexRef.current = (idx + 1) % matching.length
  }

  function handleReplaceAll(): void {
    if (!searchQuery || !replaceText) return
    const regex = new RegExp(escapeRegex(searchQuery), 'gi')
    const lower = searchQuery.toLowerCase()
    let changed = false
    const newSegments = segments.map((s) => {
      if (!s.text.toLowerCase().includes(lower)) return s
      changed = true
      return { ...s, text: s.text.replace(regex, replaceText) }
    })
    if (changed) {
      setSegments(newSegments)
      onMutation()
    }
  }

  const filteredSegments = useMemo(
    () =>
      segments.filter((seg) =>
        searchQuery ? seg.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
      ),
    [segments, searchQuery]
  )

  const matchCount = searchQuery
    ? segments.filter((s) => s.text.toLowerCase().includes(searchQuery.toLowerCase())).length
    : 0

  return {
    filteredSegments,
    handleReplace,
    handleReplaceAll,
    matchCount,
    replaceText,
    searchQuery,
    setReplaceText,
    setSearchQuery,
    setShowReplace,
    showReplace
  }
}
