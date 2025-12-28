import { useRef, useState } from "react"
import { float32ToInt16, isSpeaking } from "../utils/auidoUtils"
import { typeText } from "../utils/tauriUtils"

const WS_URL = "ws://localhost:3000/audio"
const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4096
const VOLUME_THRESHOLD = 0.01
const SILENCE_FRAMES = 5 // Wait 5 frames before stopping animation

export function useAudioRecorder() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isAudioActive, setIsAudioActive] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioActiveRef = useRef(false)

  const startRecording = async () => {
    console.log(" Starting mic")

    audioActiveRef.current = false
    setIsAudioActive(false)
    setIsAnimating(false)

    // Setup WebSocket
    const socket = new WebSocket(WS_URL)
    socket.binaryType = "arraybuffer"
    socketRef.current = socket

   socket.onmessage = async (e) => {
  
  const msg = JSON.parse(e.data)
  if (msg.is_final && msg.transcript) {
    
    await typeText(msg.transcript + " ")
  } else {
    console.log("Message not final or no text:", msg) // Add this
  }
}
    // Wait for WebSocket to connect
    await new Promise<void>((resolve) => {
      socket.onopen = () => {
        console.log("✅ WebSocket connected")
        resolve()
      }
    })

    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    // Setup audio processing pipeline
    const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
    audioContextRef.current = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    sourceRef.current = source

    const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1)
    processorRef.current = processor

    const silent = audioContext.createGain()
    silent.gain.value = 0

    let silenceCounter = 0
    

    processor.onaudioprocess = (e) => {
      if (socket.readyState !== WebSocket.OPEN) return

      const channelData = e.inputBuffer.getChannelData(0)
      const pcm = float32ToInt16(channelData)
      socket.send(pcm)

      // Detect if user is speaking based on volume
      const speaking = isSpeaking(channelData, VOLUME_THRESHOLD)

      if (speaking) {
        silenceCounter = 0
        if (!audioActiveRef.current) {
          audioActiveRef.current = true
          setIsAudioActive(true)
          setIsAnimating(true)
        }
      } else {
        // Only stop animation after several silent frames (smoothing)
        silenceCounter++
        if (silenceCounter > SILENCE_FRAMES && audioActiveRef.current) {
          audioActiveRef.current = false
          setIsAudioActive(false)
          setIsAnimating(false)
        }
      }
    }

    // Connect audio pipeline
    source.connect(processor)
    processor.connect(silent)
    silent.connect(audioContext.destination)

    console.log("Audio pipeline active")
  }

  const stopRecording = async () => {
    console.log("Stopping mic")

    audioActiveRef.current = false
    setIsAudioActive(false)
    setIsAnimating(false)

    // Cleanup audio pipeline
    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    streamRef.current?.getTracks().forEach((t) => t.stop())

    await audioContextRef.current?.close()
    socketRef.current?.close()

    // Clear refs
    processorRef.current = null
    sourceRef.current = null
    audioContextRef.current = null
    streamRef.current = null
    socketRef.current = null
  }

  return {
    isAnimating,
    isAudioActive,
    startRecording,
    stopRecording,
  }
}