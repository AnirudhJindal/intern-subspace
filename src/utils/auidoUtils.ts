//Convert Float32Array audio data to Int16Array (PCM format)
export function float32ToInt16(buffer: Float32Array): Int16Array {
  const int16 = new Int16Array(buffer.length)
  for (let i = 0; i < buffer.length; i++) {
    const s = Math.max(-1, Math.min(1, buffer[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16
}

//Calculate average volume/amplitude from audio buffer
export function calculateVolume(buffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.abs(buffer[i])
  }
  return sum / buffer.length
}

// Check if audio volume is above speaking threshold
 
export function isSpeaking(buffer: Float32Array, threshold: number = 0.01): boolean {
  const volume = calculateVolume(buffer)
  return volume > threshold
}