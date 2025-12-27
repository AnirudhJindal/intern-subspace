// Prevents extra console window on Windows release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, GlobalShortcutManager};
use tauri::command;

use enigo::{Enigo, Keyboard, Settings};

#[command]
fn type_text(text: String) -> Result<(), String> {
    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| e.to_string())?;

    enigo.text(&text);
    Ok(())
}

fn main() {
  tauri::Builder::default()
   //  register Enigo command
    .invoke_handler(tauri::generate_handler![type_text])
    .setup(|app| {
      let app_handle = app.handle();
      let handle_for_toggle = app_handle.clone();
      let handle_for_listening = app_handle.clone();

      #[cfg(target_os = "macos")]
      let toggle_window_shortcut = "Command+Shift+Space";

      #[cfg(any(target_os = "windows", target_os = "linux"))]
      let toggle_window_shortcut = "Ctrl+Shift+Space";

      app_handle
        .global_shortcut_manager()
        .register(toggle_window_shortcut, move || {
          let window = handle_for_toggle
            .get_window("main")
            .expect("main window not found");

          if window.is_visible().unwrap() {
            window.hide().unwrap();
          } else {
            window.show().unwrap();
            window.set_focus().unwrap();
          }
        })
        .expect("failed to register toggle window shortcut");

      // =====================================
      // Shortcut 2: Toggle listening
      // Cmd+L (mac)
      // Ctrl+L (win/linux)
      // =====================================

      #[cfg(target_os = "macos")]
      let toggle_listening_shortcut = "Command+L";

      #[cfg(any(target_os = "windows", target_os = "linux"))]
      let toggle_listening_shortcut = "Ctrl+L";

      app_handle
        .global_shortcut_manager()
        .register(toggle_listening_shortcut, move || {
          let window = handle_for_listening
            .get_window("main")
            .expect("main window not found");

          // Bring app to front (optional UX)
          window.show().unwrap();
          

          // Notify frontend to start/stop mic
          window
            .emit("toggle-listening", ())
            .expect("failed to emit toggle-listening event");
        })
        .expect("failed to register toggle listening shortcut");

      Ok(())
    })
   
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
