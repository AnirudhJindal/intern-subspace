import { appWindow } from "@tauri-apps/api/window"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useAudioRecorder } from "./hooks/useAudioRecorder"
import { AudioVisualizer } from "./components/AudioVisualizer"

function App() {
  const [isListening, setIsListening] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAiMode, setIsAiMode] = useState(false)

  const { isAnimating, isAudioActive, startRecording, stopRecording } =
    useAudioRecorder()

  // Listening toggle
  useEffect(() => {
    if (isListening) {
      startRecording()
    } else {
      stopRecording()
    }
  }, [isListening])

  // Global shortcut listener for toggle-listening
  useEffect(() => {
    const unlisten = listen("toggle-listening", () => {
      console.log("Toggle listening")
      setIsListening((prev) => !prev)
      // Don't toggle AI mode here - keep it separate
    })
    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  // Global shortcut listener for toggle-ai
  useEffect(() => {
    const unlisten = listen("toggle-ai", () => {
      console.log("Toggle AI mode")
      setIsAiMode((prev) => !prev)
      // When AI mode is toggled on, start listening
      setIsListening((prev) => !prev)
    })
    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  // Entrance animation
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  // Window dragging
  const handleMouseDown = async () => {
    await appWindow.startDragging()
  }

  // Scale logic
  const getScale = () => {
    if (isAnimating) return 1.05
    if (isListening || isAudioActive) return 1.05
    return 1
  }

  // Text display logic
  const getDisplayText = () => {
    if (isAiMode) {
      return isListening ? "AI on " : "AI off"
    }
    return isListening ? "listening…" : "hello?"
  }

  // Border color based on mode
  const getBorderColor = () => {
    if (isAiMode) {
      return isListening ? "border-purple-500" : "border-purple-400"
    }
    return "border-white"
  }

  // Glow effect for AI mode
  const getGlowEffect = () => {
    if (isAiMode && isListening) {
      return "shadow-[0_0_17px_rgba(168,85,247,0.5)]"
    }
    if (isAiMode) {
      return "shadow-[0_0_15px_rgba(168,85,247,0.3)]"
    }
    return ""
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-transparent">
      <motion.div
        onMouseDown={handleMouseDown}
        animate={{ scale: getScale() }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className={`
          flex items-center gap-4
          bg-[#1a1a1a] border-2
          ${getBorderColor()}
          ${getGlowEffect()}
          rounded-[50px] px-8 py-4
          cursor-move select-none
          transition-all duration-500 ease-out
          hover:scale-105
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
      >
        <AudioVisualizer isAnimating={isAnimating} isAiMode={isAiMode} />

        <div 
          className={`
            text-xl font-semibold select-none
            transition-colors duration-300
            ${isAiMode ? "text-purple-400" : "text-white"}
          `}
        >
          {getDisplayText()}
        </div>

        {/* AI Mode indicator badge */}
        {isAiMode && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default App