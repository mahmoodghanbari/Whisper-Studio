import { useEffect, useRef, useState } from 'react'
import type React from 'react'
import { Play, Pause, Volume2, Repeat, Rewind, FastForward } from 'lucide-react'
import { captions } from '@/captions'

interface AudioPlayerProps {
  src?: string
  knownDuration?: number
  onTimeUpdate?: (seconds: number) => void
  seekToRef?: React.MutableRefObject<((seconds: number) => void) | null>
}

function secondsToDisplay(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function AudioPlayer({
  src,
  knownDuration,
  onTimeUpdate,
  seekToRef
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSeconds, setCurrentSeconds] = useState(0)
  const [durationSeconds, setDurationSeconds] = useState(0)

  useEffect(() => {
    setIsPlaying(false)
    setCurrentSeconds(0)
    setDurationSeconds(0)
  }, [src])

  useEffect(() => {
    if (seekToRef) {
      seekToRef.current = (seconds: number) => {
        const audio = audioRef.current
        if (audio) audio.currentTime = seconds
      }
    }
  }, [seekToRef])

  function handleTogglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      void audio.play()
    }
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    const totalDuration = durationSeconds || knownDuration || 0
    if (!audio || !totalDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * totalDuration
  }

  const effectiveDuration = durationSeconds || knownDuration || 0
  const progress = effectiveDuration > 0 ? (currentSeconds / effectiveDuration) * 100 : 0

  return (
    <div className="shrink-0 border-t border-border/50 bg-card/60 backdrop-blur-xl px-6 py-3">
      {src && (
        <audio
          ref={audioRef}
          src={src.startsWith('file://') ? src : `file://${src}`}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            const t = audioRef.current?.currentTime ?? 0
            setCurrentSeconds(t)
            onTimeUpdate?.(t)
          }}
          onLoadedMetadata={() => setDurationSeconds(audioRef.current?.duration ?? 0)}
        />
      )}
      <div className="flex items-center gap-5">
        {/* Transport */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = Math.max(0, currentSeconds - 10)
            }}
          >
            <Rewind className="w-4 h-4" />
          </button>
          <button
            onClick={handleTogglePlay}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            onClick={() => {
              if (audioRef.current)
                audioRef.current.currentTime = Math.min(durationSeconds, currentSeconds + 10)
            }}
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Time + Waveform seek */}
        <div className="flex-1 flex items-center gap-3">
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-16">
            {secondsToDisplay(currentSeconds)}
          </span>
          <div className="flex-1 group cursor-pointer" onClick={handleSeek}>
            <div className="relative h-8 flex items-center">
              {/* Waveform bars */}
              <div className="absolute inset-0 flex items-center gap-[2px] overflow-hidden">
                {Array.from({ length: 120 }).map((_, i) => {
                  const h = 20 + Math.abs(Math.sin(i * 0.4) * 60) + Math.abs(Math.cos(i * 0.7) * 20)
                  const played = (i / 120) * 100 < progress
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-full transition-colors ${played ? 'bg-primary' : 'bg-muted-foreground/25'}`}
                      style={{ height: `${Math.min(100, h)}%` }}
                    />
                  )
                })}
              </div>
              {/* Playhead */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary rounded-full shadow-[0_0_8px] shadow-primary/50"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums w-16 text-right">
            {effectiveDuration > 0
              ? secondsToDisplay(effectiveDuration)
              : captions.audioPlayer.defaultDuration}
          </span>
        </div>

        {/* Volume + speed */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <div className="w-20 h-1 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-muted-foreground/50 rounded-full"
                style={{ width: '75%' }}
              />
            </div>
          </div>
          <button className="text-[11px] text-muted-foreground hover:text-foreground font-mono px-2.5 py-1 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
            {captions.audioPlayer.speed}
          </button>
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
