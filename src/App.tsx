import { appWindow } from "@tauri-apps/api/window"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { useAudioRecorder } from "./hooks/useAudioRecorder"
import { AudioVisualizer } from "./components/AudioVisualizer"

function App() {
  const [isListening, setIsListening] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

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

  
  //Global shortcut listener
  
  useEffect(() => {
    const unlisten = listen("toggle-listening", () => {
      console.log("Toggle listening")
      setIsListening((prev) => !prev)
    })
    return () => {
      unlisten.then((f) => f())
    }
  }, [])

  //Entrance animation

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  //Window dragging
  const handleMouseDown = async () => {
    await appWindow.startDragging()
  }

  //Scale logic

  const getScale = () => {
    if (isAnimating) return 1.05
    if (isListening || isAudioActive) return 1.05
    return 1
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
          bg-[#1a1a1a] border-2 border-white
          rounded-[50px] px-8 py-4
          cursor-move select-none
          transition-opacity duration-500 ease-out
          hover:scale-105
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
      >
        <AudioVisualizer isAnimating={isAnimating} />

        <div className="text-white text-xl font-semibold select-none">
          {isListening ? "listening…" : "hello?"}
        </div>
      </motion.div>
    </div>
  )
}

export default App