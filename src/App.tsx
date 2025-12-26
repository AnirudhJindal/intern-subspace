import { appWindow } from "@tauri-apps/api/window"
import { listen } from "@tauri-apps/api/event"
import { useState, useEffect } from "react"
import { motion } from "motion/react"

function App() {
  const [isListening, setIsListening] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // Smooth entrance animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  // 🔗 Listen to Rust global "L" shortcut
  useEffect(() => {
    const unlistenPromise = listen("toggle-listening", () => {
      setIsListening(prev => !prev)
    })

    return () => {
      unlistenPromise.then(unlisten => unlisten())
    }
  }, [])

  // Allow dragging the floating window
  const handleMouseDown = async () => {
    await appWindow.startDragging()
  }

  // Toggle on click as well
  const toggleListening = () => {
    setIsListening(prev => !prev)
  }

  // Sound wave bars configuration
  const bars = [
    { idle: 10, active: 24, delay: 0 },
    { idle: 14, active: 32, delay: 0.1 },
    { idle: 18, active: 40, delay: 0.2 },
    { idle: 14, active: 32, delay: 0.3 },
    { idle: 12, active: 28, delay: 0.4 },
    { idle: 16, active: 36, delay: 0.5 },
  ]

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-transparent">
      <div
        onMouseDown={handleMouseDown}
        onClick={toggleListening}
        className={`
          flex items-center gap-4
          bg-[#1a1a1a] border-2 border-white
          rounded-[50px] px-8 py-4
          cursor-move select-none
          transition-all duration-500 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
          ${isListening ? "scale-105" : ""}
        `}
      >
        {/* 🔊 Sound wave animation */}
        <div className="flex items-center gap-1">
          {bars.map((bar, i) => (
            <motion.div
              key={`${isListening}-${i}`} // ⬅️ forces stop/start cleanly
              className="w-[3px] bg-white rounded-sm"
              animate={{
                height: isListening
                  ? [bar.idle, bar.active, bar.idle]
                  : bar.idle,
              }}
              transition={{
                duration: isListening ? 0.8 : 0.25,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut",
                delay: bar.delay,
              }}
            />
          ))}
        </div>

        {/* Text */}
        <div className="text-white text-xl font-semibold select-none transition-all duration-300">
          {isListening ? "listening..." : "hello"}
        </div>
      </div>
    </div>
  )
}

export default App
