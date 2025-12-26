import { appWindow } from "@tauri-apps/api/window"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"

function App() {
  const [isListening, setIsListening] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // refs for audio + socket
  const socketRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  /* -----------------------------
     Float32 → Int16 PCM
  ------------------------------ */
  const floatTo16BitPCM = (input: Float32Array) => {
    const buffer = new ArrayBuffer(input.length * 2)
    const view = new DataView(buffer)

    let offset = 0
    for (let i = 0; i < input.length; i++, offset += 2) {
      let sample = Math.max(-1, Math.min(1, input[i]))
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      )
    }

    return buffer
  }

  /* -----------------------------
     Start microphone (PCM)
  ------------------------------ */
  const startMic = async () => {
    // WebSocket
    const socket = new WebSocket("ws://localhost:3000/audio")
    socket.binaryType = "arraybuffer"
    socketRef.current = socket

    // Mic
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    // AudioContext (match Deepgram)
    const audioContext = new AudioContext({ sampleRate: 16000 })
    audioContextRef.current = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    sourceRef.current = source

    const processor = audioContext.createScriptProcessor(4096, 1, 1)
    processorRef.current = processor

    processor.onaudioprocess = e => {
      if (socket.readyState !== WebSocket.OPEN) return

      const input = e.inputBuffer.getChannelData(0)
      const pcm16 = floatTo16BitPCM(input)

      socket.send(pcm16)
    }

    source.connect(processor)
    processor.connect(audioContext.destination)
  }

  /* -----------------------------
     Stop microphone
  ------------------------------ */
  const stopMic = async () => {
    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()

    await audioContextRef.current?.close()

    streamRef.current?.getTracks().forEach(t => t.stop())
    socketRef.current?.close()

    processorRef.current = null
    sourceRef.current = null
    audioContextRef.current = null
    streamRef.current = null
    socketRef.current = null
  }

  /* -----------------------------
     Toggle listening
  ------------------------------ */
  useEffect(() => {
    if (isListening) {
      startMic()
    } else {
      stopMic()
    }

    return () => {
      stopMic()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening])

  /* -----------------------------
     Tauri shortcut listener
  ------------------------------ */
  useEffect(() => {
    const unlistenPromise = listen("toggle-listening", () => {
      setIsListening(prev => !prev)
    })

    return () => {
      unlistenPromise.then(unlisten => unlisten())
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
      <div
        onMouseDown={handleMouseDown}
        onClick={() => setIsListening(p => !p)}
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
        <div className="flex items-center gap-1">
          {bars.map((bar, i) => (
            <motion.div
              key={`${isListening}-${i}`}
              className="w-0.75 bg-white rounded-sm"
              animate={{
                height: isListening
                  ? [bar.idle, bar.active, bar.idle]
                  : bar.idle,
              }}
              transition={{
                duration: isListening ? 0.8 : 0.25,
                repeat: isListening ? Infinity : 1,
                ease: "easeInOut",
                delay: bar.delay,
              }}
            />
          ))}
        </div>

        <div className="text-white text-xl font-semibold select-none">
          {isListening ? "listening..." : "hello"}
        </div>
      </div>
    </div>
  )
}

export default App
