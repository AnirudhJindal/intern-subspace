import OpenAI from "openai";
import { Readable } from "stream";
import Speaker from "speaker";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI();

interface tts {
  input: string;
  emotion: string;
  expressions: string;
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" | "coral";
}

export default async function tts({ voice, input, emotion, expressions }: tts) {
  const response = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: voice,
    input: input,
    instructions: `speak with these emotions ${emotion} and these expressions ${expressions}`,
    response_format: "wav",
  });

  // Convert Web Stream to Node.js stream
  const nodeStream = Readable.fromWeb(response.body as any);

  const speaker = new Speaker({
    channels: 1,        // Mono audio - single channel for voice (1=mono, 2=stereo)
    bitDepth: 16,       // CD quality precision - 16-bit samples give ~96dB dynamic range
    sampleRate: 24000,  // OpenAI TTS standard - 24kHz captures all voice frequencies
    lowWaterMark: 0,    // Minimum buffered bytes before writing - 0 starts immediately
    highWaterMark: 0,   // Maximum buffered bytes - 0 uses default Node.js stream behavior
  });

  console.log("Playing audio...");
  nodeStream.pipe(speaker);

  speaker.on("close", () => {
    console.log("Audio finished playing");
  });
}