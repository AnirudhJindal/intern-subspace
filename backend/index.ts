import WebSocket, { WebSocketServer } from "ws"
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk"
import dotenv from "dotenv"

dotenv.config()

const deepgram = createClient()

const wss = new WebSocketServer({ port: 3000 })

wss.on("connection", async (clientSocket, req) => {
  if (!req.url || req.url !== "/audio") {
    clientSocket.close()
    return
  }

  const dgConnection = deepgram.listen.live({
     model: "nova-3",
  encoding: "linear16",
  sample_rate: 16000,
  channels: 1,
  interim_results: true,
  })

  dgConnection.on(LiveTranscriptionEvents.Open, () => {
    console.log("Deepgram connected")


  
  })

    clientSocket.on("message", audioChunk => {
    if (dgConnection.getReadyState() === WebSocket.OPEN) {
        //@ts-ignore
      dgConnection.send(audioChunk )
    }
  })

  dgConnection.on(LiveTranscriptionEvents.Transcript, data => {
    const transcript = data.channel?.alternatives?.[0]?.transcript

    if (transcript) {
      console.log(transcript)
        }
    }
  )

   dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
    console.error(err);
  });

  clientSocket.on("close", () => {
    dgConnection.requestClose()
  })
})
