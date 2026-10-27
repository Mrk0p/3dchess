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
- Undo and new-game controls for local play
- Flip board orientation
- Copy current FEN position
- Pawn promotion defaults to queen
- Online two-player rooms with invite links
- Server-validated moves and Supabase Realtime synchronization

## Feature-oriented structure
- `app/`: Next.js routes, metadata, and global styles
- `components/chess-board/`: 3D board UI and Three.js scene lifecycle
- `features/game/`: local game state, controls, move history, and FEN panel
- `features/multiplayer/`: online room UI, board interactions, and styling
- `lib/multiplayer/`: server-side room validation and Supabase clients
- `app/api/multiplayer/`: create/join/read/move endpoints
- `supabase/migrations/`: multiplayer database schema

## Enable online multiplayer

1. Create a Supabase project.
2. Run `supabase/migrations/202610260001_online_chess.sql` in the Supabase SQL Editor.
3. Configure these environment variables locally in `.env.local` and in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key used by the browser Realtime client
   - `SUPABASE_SECRET_KEY`: server-only Supabase secret key used by API routes; never prefix it with `NEXT_PUBLIC_`
   - `SUPABASE_JWKS_URL`: optional Auth JWKS URL; not currently required by multiplayer routes
4. Deploy the Next.js app. Open **Online Play**, create a room, and share the invite link.
5. Test using two separate browser profiles/devices.

The database has Row Level Security enabled with no direct client table policies. Room operations go through server routes. Room IDs are unguessable UUIDs and seat tokens are stored as hashes in the database. This is an initial multiplayer implementation; add production rate limiting, monitoring, and a recovery/expiry policy before broad public launch.

## Deployment
Import `Mrk0p/3dchess` into Vercel. Select the `feat/online-multiplayer` branch for preview testing or open a pull request to the deployment branch. Configure the environment variables above before testing online rooms.

A successful production build and live deployment must be verified in a network-enabled environment.
