# 🎬 Who's Winning? — Netflix-Themed Raffle

A high-fidelity Netflix-themed raffle designed for **JPCS-DLSL** events. 

The application replicates the iconic Netflix **"Who's Watching?"** profiles selection screen. An operator pastes participant names, launches the fullscreen raffle display projected to the crowd, and triggers a draw. A cursor jitters across cards and decelerates onto a randomly selected winner, followed by a cinematic zoom-in profile reveal.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation
```bash
npm install
```

### Development Server
Run the local Vite development server:
```bash
npm run dev
```

### Production Build
Build the static application assets for production (output in the `/dist` directory):
```bash
npm run build
```

### Linting
Run ESLint to check for stylistic and code quality issues:
```bash
npm run lint
```

---

## 🎨 Visual Target & Design Aesthetics

- **Netflix Identity:** Faithfully recreates the `#141414` background, `#E50914` red accents, card proportions, and typography.
- **Typography:** Uses **Inter** (weights 400 + 500) loaded via Google Fonts as the closest fallback to Netflix Sans.
- **Custom Avatars:** Shuffles and assigns from a static pool of **~800 public Netflix CDN URLs** (`nflxso.net`). Additional reference lists and backup avatar pools are documented in the [JPCS Avatar Reference Doc](https://docs.google.com/document/d/1hfaGPmfDLyb19nQZXPLU5RbrQOWzj0ALqWjRXx_UOVI/edit?usp=sharing).
- **Initials Fallback:** Safe `<img onError>` fallback handling swaps broken/offline CDN avatars to colored initial squares without throwing errors.
- **Operator HUD:** Controls are rendered as a minimal, semi-transparent HUD in the bottom-corner to prevent visual pollution on the projected display. The grid remains the hero of the screen.

---

## ⚙️ Core Features & Functional Requirements

### 1. Setup Screen
* **Operator Input:** Textarea accepts newline-separated plain text, allowing direct copy-paste from Google Sheets columns.
* **Live Validation:** Automatically trims whitespace, ignores blank lines, and displays a live count of valid participants.
* **Suspense Slider:** Operator can configure the total jitter animation length (3–10 seconds, default: 5s).
* **Start Gate:** Transitioning to the raffle screen requires a minimum of 2 valid names.

### 2. Raffle Grid
* **Breakpoint Grid:** Automatically adapts card sizes and column counts dynamically using fixed thresholds (≤10→3, ≤20→4, ≤35→5, ≤56→6, ≤80→7, ≤110→8, >110→9 columns) to ensure cards remain legible.
* **Unload Guard:** Displays a browser confirmation prompt on attempt to reload or navigate away mid-raffle.

### 3. Draw Engine
* **Pre-selection:** The winner is selected instantly when "Draw" is pressed. The animation is purely theatrical.
* **Jitter Phase:** Cursor jumps chaotically across cards at random, highlighting cards and playing a Netflix "Tudum" sound effect.
* **Deceleration Phase:** Cursor slows down progressively over 4–5 hops, locking onto the pre-selected winner with a distinct chime sound effect.
* **Cinematic Reveal:** Grid dims (70% opacity) and the winner's card zooms (to ~60vw) followed by a fixed 800ms suspense pause, after which the name fades in.
* **Grid Reflow:** The winner is removed from the active pool, and remaining cards fade out and reflow smoothly via CSS transitions.

### 4. Operator Controls
* **Undo Support:** Allows restoring the most recently drawn winner back into the active pool (appended at the end of the grid). Single-level undo only.
* **Cancel Mid-Draw:** Operator can cancel the draw mid-animation, removing no participants and clearing the cursor.

---

## 🛠️ Architecture & Technical Decisions

### State Flow
Unidirectional data flow. View state (`'setup' | 'raffle'`) and `SessionConfig` are held in [App.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/App.tsx). Once transitioned, all raffle state mutations (active pool, undo stack, phases) are managed inside the [useRaffle.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/hooks/useRaffle.ts) custom hook. Components are purely presentational and re-render based on hook outputs.

### No Persistence Design
To ensure privacy and high reset-safety, the application does not persist state across page reloads (no `localStorage`, `cookies`, or backend). Refreshing the page starting a new session always begins fresh.

### Performance & Web Audio API
- **Animation Loop:** Cursor positions and timings are driven via `requestAnimationFrame` using a React `ref` to prevent excessive React render thrashing.
- **Lazy Audio:** Chrome blocks `AudioContext` until a user gesture. The [useAudio.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/hooks/useAudio.ts) hook initializes the `AudioContext` lazily on the first user-triggered draw click. Sound cues fail silently and safely if blocked.

---

## 📂 Project Structure

- `public/`
  - [jpcs-logo.png](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/public/jpcs-logo.png) — JPCS static logo asset
  - `assets/sounds/`
    - [jitter-start.mp3](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/public/assets/sounds/jitter-start.mp3) — Netflix-style "Tudum" start sound
    - [winner-lock.mp3](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/public/assets/sounds/winner-lock.mp3) — Distinct lock-in sound chime
- `src/`
  - [main.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/main.tsx) — Vite application entry point
  - [App.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/App.tsx) — Root container holding state and view toggle
  - [App.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/App.module.css)
  - [types.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/types.ts) — Shared type contracts (Participant, SessionConfig, etc.)
  - [index.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/index.css) — Custom global stylesheet
  - `setup/`
    - [SetupScreen.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/setup/SetupScreen.tsx) — Main setup view component
    - [SetupScreen.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/setup/SetupScreen.module.css)
  - `raffle/`
    - [RaffleScreen.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/RaffleScreen.tsx) — Screen scaffold and layout supervisor
    - [RaffleScreen.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/RaffleScreen.module.css)
    - [ProfileGrid.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/ProfileGrid.tsx) — Dynamically sized card grid
    - [ProfileGrid.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/ProfileGrid.module.css)
    - [ProfileCard.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/ProfileCard.tsx) — Presentational profile square
    - [ProfileCard.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/ProfileCard.module.css)
    - [RaffleCursor.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/RaffleCursor.tsx) — Absolute-positioned overlay selection cursor
    - [RaffleCursor.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/RaffleCursor.module.css)
    - [WinnerOverlay.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/WinnerOverlay.tsx) — Overlay for cinematic profile zoom and winner name reveal
    - [WinnerOverlay.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/WinnerOverlay.module.css)
    - [OperatorControls.tsx](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/OperatorControls.tsx) — Interactive operator HUD
    - [OperatorControls.module.css](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/raffle/OperatorControls.module.css)
  - `hooks/`
    - [useRaffle.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/hooks/useRaffle.ts) — Primary custom hook containing the draw and timing engine
    - [useAudio.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/hooks/useAudio.ts) — Custom Web Audio API loader/player
  - `lib/`
    - [parseNames.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/lib/parseNames.ts) — Newline name parser and validator (Tier 2 upgrade boundary)
    - [getColumnCount.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/lib/getColumnCount.ts) — Fixed breakpoint lookup utility
    - [avatars.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/lib/avatars.ts) — Shuffled library of Netflix CDN avatar URLs
- [index.html](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/index.html)
- [vite.config.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/vite.config.ts)
- [tsconfig.json](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/tsconfig.json)

---

## 🔮 Future Improvements & v2 Backlog

The following backlog details planned enhancements for future JPCS event iterations:

### 🎵 Audio & SFX Enhancements
* **Deceleration Pitch Bend:** Dynamically adjust the Web Audio API frequency or schedule discrete ticking clicks that decelerate in tempo along with the cursor, giving physical weight to the slowdown.
* **Confetti & Winner Sound Effect:** Trigger a celebratory crowd cheer or confetti pop sound effect when the winner overlay is revealed.
* **HUD Audio Toggle:** Implement a small speaker toggle icon in the Operator Controls HUD to easily mute/unmute SFX at the venue.

### 🔌 Self-Registration Upgrade (Tier 2 Integration Seam)
To upgrade from manual operator input to user self-registration, the project structure defines an isolated seam inside [parseNames.ts](file:///c:/Users/User/Desktop/lock_in/JPCS/whos-winning-netflix-raffle/src/lib/parseNames.ts):
* **QR-Code Portal:** Replace the Setup Screen text input with a projected QR code directing participants to a mobile registration form.
* **Self-Enrollment:** Participants enter their name and select their favorite Netflix profile avatar on their own device.
* **Real-Time Database Sync:** Swap `parseNames.ts` data ingestion with a Supabase or Firebase Realtime subscription. As participants submit, their cards slide into the live grid on the projection screen in real time.

---

## 📄 License
Designed and maintained by the **Junior Philippine Computer Society (JPCS) - DLSL Chapter**. For internal organization use and event presentations.
