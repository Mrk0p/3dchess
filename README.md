# 3D Chess

A browser-based chess game built with **Next.js App Router**, React, Three.js, and chess.js. The project is organized into small, feature-focused modules.

## Requirements
- Node.js 20.9 or newer
- npm
- A modern browser with WebGL support

## Run locally
```bash
npm install
npm run dev
```

## Production build
```bash
npm run build
npm start
```

## Features
- 3D chessboard with orbit and zoom controls
- Legal moves and highlighted destinations
- Move history and game status
- Undo and new-game controls
- Flip board orientation
- Copy current FEN position
- Pawn promotion defaults to queen

## Feature-oriented structure
- `app/`: Next.js routes, metadata, and global styles
- `components/chess-board/`: 3D board UI and Three.js scene lifecycle
- `features/game/useChessGame.js`: game state and chess actions
- `features/game/GameControls.jsx`: reset, undo, and orientation controls
- `features/game/MoveHistory.jsx`: notation history
- `features/game/FenPanel.jsx`: FEN display and clipboard action
- `features/game/chess-utils.js`: status and notation helpers

## Deployment
Import `Mrk0p/3dchess` into Vercel. Framework preset: **Next.js**. Build command and output directory can remain at their defaults.

A successful production build and live deployment must be verified in a network-enabled environment.
