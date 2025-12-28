# Voice to Text App

A real-time voice-to-text application built with Tauri, React, and WebSocket. Speak into your microphone and watch your words appear on screen with live audio visualization.

## Features

- Real-time speech-to-text transcription
- Animated audio visualizer that responds to your voice
- Draggable floating window interface
- Automatic text typing via system keyboard simulation
- Volume-based animation (only animates when you speak)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri)
- npm or yarn

## Project Structure

```
.
├── src/                    # Frontend React code
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utility functions
├── src-tauri/             # Tauri backend (Rust)
├── backend/               # WebSocket server
│   ├── index.ts          # Server entry point
│   └── .env              # Environment variables
└── package.json
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   Create a `.env` file in the `backend` folder:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Or create it manually with your configuration:
   ```env
   DEEPGRAM_API_KEY=your_api_key_here
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## Usage

The application will start automatically after running `npm start` in the installation steps.

A floating widget will appear on your screen.

### Keyboard Shortcuts

- **Ctrl + Shift + Space** - Show/hide the floating window
- **Ctrl + L** - Start listening (begin recording)
- **Ctrl + L** (again) - Stop listening (stop recording)

### How it works

1. Press **Ctrl + L** to start listening
2. Speak into your microphone - the bars will animate when you speak
3. Your speech will be transcribed and typed automatically where your cursor is
4. Press **Ctrl + L** again to stop listening
5. Use **Ctrl + Shift + Space** to hide/show the widget window

## Deepgram API Configuration

The backend uses Deepgram for speech-to-text. Make sure to:
1. Sign up at [Deepgram](https://deepgram.com)
2. Get your API key
3. Add it to `backend/.env`

## Troubleshooting

### Microphone not working
- Check browser/system microphone permissions
- Ensure no other app is using the microphone

### Text not typing
- Verify the Tauri backend is compiled with the `type_text` command
- Check that `enigo` is properly configured in `src-tauri/Cargo.toml`

### WebSocket connection fails
- Ensure backend server is running on port 3000
- Check firewall settings
- Verify `.env` configuration in backend folder
- Confirm `DEEPGRAM_API_KEY` is set correctly

### Audio visualization not responding
- Adjust `VOLUME_THRESHOLD` if too sensitive/insensitive
- Check console for audio pipeline errors

## Development

### Frontend Stack
- React + TypeScript
- Tauri (Rust)
- Framer Motion (animations)
- Tailwind CSS

### Backend Stack
- Node.js + TypeScript
- WebSocket server
- Deepgram API for speech-to-text

## Building for Production

```bash
npm run tauri build
```

This will create platform-specific executables in `src-tauri/target/release/`.

## License

MIT License
