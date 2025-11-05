import type React from "react"
import { useState, useRef, useEffect } from "react"

interface Position {
  x: number
  y: number
}

export default function VideoShowcase() {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const windowRef = useRef<HTMLDivElement>(null)

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
                  <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900">Agent</h1>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                </div>
                <p className="text-base lg:text-lg text-neutral-700 leading-relaxed font-medium max-w-sm">
                  将编码任务委派出去，让你专注于更高层的方向把控。
                </p>
              </div>
            </div>

            {/* Right side - Window with background */}
            <div className="relative w-full lg:w-3/5 flex-shrink-0 flex items-center justify-center">
              {/* Background painting - contained within the right side, not full width */}
              <div className="absolute inset-0 -right-12 lg:-right-16 xl:-right-20 bg-gradient-to-b from-amber-50 to-yellow-50 rounded-l-3xl overflow-hidden">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  <img
                    src="https://cdn.sanity.io/images/2hv88549/production/1ffde036387b7242c29496bd7b1009f2218bce43-3266x2324.jpg?auto=format&w=2000&q=80"
                    alt="Oil painting background"
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-white/3 pointer-events-none" />
                </div>
              </div>

              {/* Window - positioned relative to right side container */}
              <div className="relative z-20">
                <div
                  ref={windowRef}
                  className={`relative bg-white rounded-xl shadow-2xl overflow-hidden border border-neutral-200 transition-all ${
                    !isMobile ? "cursor-grab hover:shadow-3xl" : ""
                  } ${isDragging ? "cursor-grabbing" : ""}`}
                  style={
                    !isMobile
                      ? {
                          transform: `translate(${position.x}px, ${position.y}px)`,
                          width: "520px",
                          height: "420px",
                        }
                      : {
                          width: "100%",
                          maxWidth: "480px",
                          aspectRatio: "4/3",
                        }
                  }
                >
                  {/* Window Header */}
                  <div
                    className="bg-neutral-100 border-b border-neutral-200 px-4 py-3 flex items-center justify-between select-none"
                    onMouseDown={handleMouseDown}
                    style={{ cursor: !isMobile ? "grab" : "default" }}
                    role={!isMobile ? "button" : undefined}
                    tabIndex={!isMobile ? 0 : undefined}
                    aria-label={!isMobile ? "拖拽窗口" : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700 flex-1 text-center">Cursor</span>
                    <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">Get Cursor</span>
                  </div>

                  {/* Video content area */}
                  <div className="w-full h-[calc(100%-45px)] bg-black flex items-center justify-center overflow-hidden">
                    <iframe
                      src="//player.bilibili.com/player.html?isOutside=true&aid=115239894915816&bvid=BV1tAWFz9EQA&cid=32523943955&p=1"
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen={true}
                      title="Bilibili video player"
                      className="w-full h-full"
                      style={{ border: 0 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
