# 3D Chess

An interactive browser-based chess game built with React, Vite, Three.js, and chess.js. Play legal moves on a 3D board, orbit and zoom the view, undo moves, reset the game, flip the board, and copy the current FEN.

## Requirements
- Node.js 20.19+ or 22.12+
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
npm run preview
```

Vercel settings are included in `vercel.json`: build command `npm run build`, output directory `dist`.

## Controls
- Select a piece and then a highlighted destination.
- Drag to orbit the board and scroll to zoom.
- Undo the previous move or start a new game.
- Flip board orientation.
- Copy the current FEN position.
- Pawn promotion defaults to queen.

## Development records
- `src/PROTOCOL.md`: development protocol and versioning requirements.
- `src/ACTIVITY.md`: append-only activity and test log.

## Validation
The source has been reviewed, but a production build and browser interaction tests must be run in an environment where npm dependencies can be installed.
