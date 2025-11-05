import type React from "react"
import { useState, useRef, useEffect } from "react"

interface Position {
  x: number
  y: number
}

interface LyricLine {
  time: number
  text: string
}

export default function TabShowcase() {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [lyrics, setLyrics] = useState<LyricLine[]>([])
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const lyricsListRef = useRef<HTMLDivElement>(null)

  // Parse LRC format
  const parseLRC = (lrcText: string): LyricLine[] => {
    const lines = lrcText.split('\n')
    const lyrics: LyricLine[] = []
    
    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const milliseconds = parseInt(match[3].padEnd(3, '0'))
        const time = minutes * 60 + seconds + milliseconds / 1000
        const text = match[4].trim()
        if (text) {
          lyrics.push({ time, text })
        }
      }
    })
    
    return lyrics.sort((a, b) => a.time - b.time)
  }

  // Load lyrics
  useEffect(() => {
    fetch('/Moments.lrc')
      .then(res => res.text())
      .then(text => {
        const parsedLyrics = parseLRC(text)
        setLyrics(parsedLyrics)
      })
      .catch(err => console.error('Failed to load lyrics:', err))
  }, [])

  // Check if text is English (not Chinese)
  const isEnglish = (text: string): boolean => {
    // Check if contains Chinese characters
    return !/[\u4e00-\u9fa5]/.test(text)
  }

  // Update current lyric index based on current time
  useEffect(() => {
    if (lyrics.length === 0) return
    
    let index = 0
    // Find the latest English lyric that matches current time
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time && isEnglish(lyrics[i].text)) {
        index = i
      } else if (currentTime < lyrics[i].time) {
        break
      }
    }
    setCurrentLyricIndex(index)
    
    // Scroll to current English lyric
    if (lyricsContainerRef.current && lyricsListRef.current) {
      const container = lyricsContainerRef.current
      const lyricsList = lyricsListRef.current
      const currentElement = lyricsList.children[index] as HTMLElement
      if (currentElement) {
        const containerHeight = container.clientHeight
        const elementTop = currentElement.offsetTop
        const elementHeight = currentElement.clientHeight
        const scrollTop = elementTop - containerHeight / 2 + elementHeight / 2
        container.scrollTo({ top: scrollTop, behavior: 'smooth' })
      }
    }
  }, [currentTime, lyrics])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isMobile) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = percent * duration
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-white"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="presentation"
    >
      {/* Layer 1: White background */}
      <div className="absolute inset-0 bg-white" />

      {/* Content layout with max-width container and padding */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="relative w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left side - Text content */}
            <div className="w-full lg:w-2/5 flex-shrink-0">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900">Tab</h1>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                </div>
                <p className="text-base lg:text-lg text-neutral-600 leading-relaxed font-medium max-w-sm">
                  我们的自定义自动补全模型会预测你的下一步操作。
                </p>
              </div>
            </div>

            {/* Right side - Window with background */}
            <div className="relative w-full lg:w-3/5 flex-shrink-0 flex items-center justify-center">
              {/* Background painting - contained within the right side, not full width */}
              <div className="absolute inset-0 -right-12 lg:-right-16 xl:-right-20 bg-gradient-to-b from-gray-200 to-gray-300 rounded-l-3xl overflow-hidden">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src="https://cdn.sanity.io/images/2hv88549/production/6a23c94721e22f5c31f2ef72ccd7cdf9fecd9e12-1995x1330.jpg?auto=format&w=2000&q=80"
                    alt="Stone texture background"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />
                </div>
              </div>

              {/* Floating content - positioned relative to right side container */}
              <div 
                ref={windowRef}
                className={`relative z-20 ${
                  !isMobile ? "cursor-grab" : ""
                } ${isDragging ? "cursor-grabbing" : ""}`}
                style={
                  !isMobile
                    ? {
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        width: "400px",
                        height: "320px",
                      }
                    : {
                        width: "100%",
                        maxWidth: "400px",
                        height: "320px",
                      }
                }
                onMouseDown={handleMouseDown}
                role={!isMobile ? "button" : undefined}
                tabIndex={!isMobile ? 0 : undefined}
                aria-label={!isMobile ? "拖拽播放器" : undefined}
              >
                {/* Lyrics scrolling area */}
                <div 
                  ref={lyricsContainerRef}
                  className="relative w-full h-[calc(100%-90px)] mb-2 overflow-y-auto overflow-x-hidden bg-gradient-to-b from-red-50 to-white rounded-t-lg"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div ref={lyricsListRef} className="w-full px-6 py-8">
                    {lyrics.map((lyric, index) => {
                      const isCurrentLyric = index === currentLyricIndex
                      const isEng = isEnglish(lyric.text)
                      // Only highlight English lyrics
                      const shouldHighlight = isCurrentLyric && isEng
                      
                      return (
                        <p
                          key={index}
                          className={`mb-3 text-sm leading-relaxed font-medium transition-all duration-300 ${
                            shouldHighlight
                              ? 'text-red-500 text-base font-bold scale-105'
                              : 'text-gray-600'
                          }`}
                        >
                          {lyric.text}
                        </p>
                      )
                    })}
                  </div>
                </div>

                {/* Custom Music player styled like NetEase */}
                <div className="w-full bg-white rounded-b-lg shadow-lg border border-gray-200 p-3">
                  {/* Progress bar */}
                  <div 
                    className="w-full h-1 bg-gray-200 rounded-full cursor-pointer mb-2"
                    onClick={handleSeek}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleSeek(e as unknown as React.MouseEvent<HTMLDivElement>)
                      }
                    }}
                    role="slider"
                    tabIndex={0}
                    aria-label="播放进度"
                    aria-valuemin={0}
                    aria-valuemax={duration}
                    aria-valuenow={currentTime}
                  >
                    <div 
                      className="h-full bg-red-500 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  
                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause button */}
                      <button
                        onClick={togglePlay}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        {isPlaying ? (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Song info */}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-800">Moments - FELT</span>
                        <span className="text-xs text-gray-500">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>
                    </div>
                    
                    {/* NetEase logo */}
                    <div className="text-xs text-red-500 font-bold">♪</div>
                  </div>
                </div>

                {/* Hidden audio element */}
                <audio
                  ref={audioRef}
                  src="https://music.163.com/song/media/outer/url?id=29848676.mp3"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  aria-label="音乐播放器"
                >
                  <track kind="captions" />
                </audio>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
