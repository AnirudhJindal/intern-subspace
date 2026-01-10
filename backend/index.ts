import WebSocket, { WebSocketServer } from "ws"
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk"
import dotenv from "dotenv"

dotenv.config()

const deepgram = createClient(process.env.DEEPGRAM_API_KEY!)

const wss = new WebSocketServer({ port: 3000 })

console.log("WebSocket server running on ws://localhost:3000")

wss.on("connection", (clientSocket, req) => {
  if (req.url !== "/audio") {
    clientSocket.close()
    return
  }

  console.log("Client connected")

 const dgConnection = deepgram.listen.live({
  model: "nova-3",
  encoding: "linear16",
  sample_rate: 16000,
  channels: 1,
  interim_results: true,
  endpointing: 300,   //  REQUIRED
  punctuate: true,
  language:"multi"
})

  let dgReady = false

  dgConnection.on(LiveTranscriptionEvents.Open, () => {
    console.log("Deepgram connected")
    dgReady = true
  })

  dgConnection.on(LiveTranscriptionEvents.Transcript, data => {

    const transcript = data.channel?.alternatives?.[0]?.transcript
     // Only send final results
  if (transcript && data.is_final) {
    console.log("DG (final):", transcript)
    
    clientSocket.send(JSON.stringify({
      transcript: transcript,
      is_final: true
    }))
  }


  })

  dgConnection.on(LiveTranscriptionEvents.Error, err => {
    console.error("Deepgram error:", err)
  })

  clientSocket.on("message", audioChunk => {
    if (dgReady && dgConnection.getReadyState() === WebSocket.OPEN) {
      dgConnection.send(audioChunk)
    }
  })

  clientSocket.on("close", () => {
    console.log("Client disconnected")
    if (dgConnection.getReadyState() === WebSocket.OPEN) {
      dgConnection.requestClose() // sends Finalize
    }
  })
})

