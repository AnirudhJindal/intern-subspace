import { invoke } from "@tauri-apps/api/tauri"

// Type text using Enigo (Tauri backend)
 
export async function typeText(text: string): Promise<void> {
  if (!text.trim()) return
  console.log("Typing:", text)
  await invoke("type_text", { text })
}