# Application Activity Record

## Current state
- **Application:** 3D Chess
- **Type:** Interactive 3D chess web app
- **Stack:** React, Vite, Three.js, chess.js
- **Version:** 1.0.1 (source of truth: `package.json`)
- **Status:** Source snapshot prepared for GitHub; production build and browser validation are pending.
- **Known limitations:** Promotions default to queen; no AI opponent or online multiplayer.
- **Next action:** Install dependencies in a network-enabled environment, run the production build and interaction checklist, then verify Vercel deployment.

## Versioning policy
Every accepted application change increments the version exactly once: PATCH for fixes, MINOR for backward-compatible features, MAJOR for breaking changes. Append entries; do not erase prior results. Do not claim tests passed unless they were actually run.

## Activity history

### Baseline — 1.0.0
- **Change ID:** BASELINE-001
- **Status:** Scaffold created
- **Summary:** React/Vite application with Three.js board, chess.js move legality, history, undo/reset, board orientation, FEN display, and protocol/activity logs.
- **Tests:** Not run at baseline.

### 2026-10-24 — Board orientation refresh and scene cleanup
- **Change ID:** CHG-001
- **Status:** Source-level correction accepted; runtime validation pending
- **Previous version:** 1.0.0
- **New version:** 1.0.1
- **Summary:** Avoid repeated board flipping on state refresh and improve Three.js group cleanup.
- **Tests:** Not run; dependency install/build/browser checks pending.

### 2026-10-26 — GitHub publication preparation
- **Change ID:** REPO-001
- **Status:** BLOCKED pending runtime validation
- **Previous version:** 1.0.1
- **New version:** unchanged (1.0.1)
- **Summary:** Added repository metadata and Vercel static build configuration; prepared source and project documentation for publication.
- **Files changed:** `.gitignore`, `package.json`, `index.html`, `vite.config.js`, `vercel.json`, `src/main.jsx`, `src/App.jsx`, `src/style.css`, `README.md`, `src/PROTOCOL.md`, `src/ACTIVITY.md`
- **Tests:** Not run. npm registry access was unavailable in this environment, so dependencies and build could not be verified.
- **Security:** No credentials or secrets included.
- **Unresolved issues:** Review runtime interactions and run `npm install`, `npm run build`, then deploy.
- **Next action:** Complete build validation and connect repository to Vercel.
