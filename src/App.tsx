import { appWindow } from "@tauri-apps/api/window"
import { listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/tauri"
import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

function App() {
  const [isListening, setIsListening] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isAudioActive, setIsAudioActive] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const audioActiveRef = useRef(false)

  /* -----------------------------
     Float32 → Int16
  ------------------------------ */
  const float32ToInt16 = (input: Float32Array) => {
    const buffer = new ArrayBuffer(input.length * 2)
    const view = new DataView(buffer)

    let offset = 0
    for (let i = 0; i < input.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, input[i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    }
    return buffer
  }

  /* -----------------------------
     Typing via Enigo
  ------------------------------ */
  const typeText = async (text: string) => {
    if (!text.trim()) return
    console.log("⌨️ Typing:", text)
    await invoke("type_text", { text })
  }

  /* -----------------------------
     Start mic
  ------------------------------ */
  const startMic = async () => {
    console.log("🎤 Starting mic")

    audioActiveRef.current = false
    setIsAudioActive(false)

    const socket = new WebSocket("ws://localhost:3000/audio")
    socket.binaryType = "arraybuffer"
    socketRef.current = socket

    socket.onmessage = async (e) => {
      const msg = JSON.parse(e.data)
      if (msg.is_final && msg.text) {
        console.log("✅ Final transcript:", msg.text)
        await typeText(msg.text + " ")
      }
    }

    await new Promise<void>((res) => {
      socket.onopen = () => {
        console.log("✅ WebSocket connected")
        res()
      }
    })

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    console.log(stream)

    if(stream){
      setIsAnimating(true)
    }

    const audioContext = new AudioContext({ sampleRate: 16000 })
    audioContextRef.current = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    sourceRef.current = source

    const processor = audioContext.createScriptProcessor(4096, 1, 1)
    processorRef.current = processor

    const silent = audioContext.createGain()
    silent.gain.value = 0

    processor.onaudioprocess = (e) => {
      if (socket.readyState !== WebSocket.OPEN) return

      const pcm = float32ToInt16(e.inputBuffer.getChannelData(0))
      socket.send(pcm)

      // 🔥 audio is flowing
      if (!audioActiveRef.current) {
        audioActiveRef.current = true
        setIsAudioActive(true)
      }
    }

    source.connect(processor)
    processor.connect(silent)
    silent.connect(audioContext.destination)

    console.log("✅ Audio pipeline active")
  }

  /* -----------------------------
     Stop mic
  ------------------------------ */
  const stopMic = async () => {
    console.log("🛑 Stopping mic")

    audioActiveRef.current = false
    setIsAudioActive(false)

    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach(t => t.stop())

    await audioContextRef.current?.close()
    socketRef.current?.close()

    processorRef.current = null
    sourceRef.current = null
    audioContextRef.current = null
    streamRef.current = null
    socketRef.current = null
  }

  /* -----------------------------
     Listening toggle
  ------------------------------ */
  useEffect(() => {
    if (isListening) {
      startMic()
    } else {
      stopMic()
    }
  }, [isListening])

  /* -----------------------------
     Global shortcut
  ------------------------------ */
  useEffect(() => {
    const unlisten = listen("toggle-listening", () => {
      console.log("🎯 Toggle listening")
      setIsListening(p => !p)
    })
    return () => {
      unlisten.then(f => f())
    }
  }, [])

  /* -----------------------------
     Entrance animation
  ------------------------------ */
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleMouseDown = async () => {
    await appWindow.startDragging()
  }

  /* -----------------------------
     Scale priority logic
  ------------------------------ */
  const getScale = () => {
    if (isAnimating) return 1.08
    if (isListening || isAudioActive || isHovered) return 1.05
    return 1
  }

  /* -----------------------------
     UI
  ------------------------------ */
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
      <motion.div
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ scale: getScale() }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        className={`
          flex items-center gap-4
          bg-[#1a1a1a] border-2 border-white
          rounded-[50px] px-8 py-4
          cursor-move select-none
          transition-opacity duration-500 ease-out
          ${isVisible ? "opacity-100" : "opacity-0"}
        `}
      >
        <div className="flex items-center gap-1">
          {bars.map((bar, i) => (
            <motion.div
              key={i}
              className="w-0.75 bg-white rounded-sm"
              animate={{
                height: isAnimating
                  ? [bar.idle, bar.active, bar.idle]
                  : bar.idle,
              }}
              transition={{
                duration: 0.6,
                repeat: isAnimating ? 2 : 0,
                ease: "easeInOut",
                delay: bar.delay,
              }}
            />
          ))}
        </div>

        <div className="text-white text-xl font-semibold select-none">
          {isListening ? "listening…" : "ready"}
        </div>
      </motion.div>
    </div>
  )
}

export default App
