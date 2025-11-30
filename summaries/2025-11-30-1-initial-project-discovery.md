# Initial Project Discovery

**Date**: 2025-11-30  
**Type**: Project Assessment

## Overview

Psy-Rogue is a web-based 3rd person stealth/action game prototype inspired by **Deus Ex** and **Oni**. The project showcases an immersive sim approach with character movement, camera controls, NPC AI with patrol routes, and a Three.js-based 3D rendering engine.

## Technical Stack (Pre-Migration)

### Core Technologies
- **Three.js** r100 - 3D rendering engine
- **RxJS 4.x** (legacy `rx` package) - Reactive programming
- **Snabbdom 0.5.4** - Virtual DOM for UI
- **iblokz** libraries - Custom state management and helpers
  - `iblokz-data` 1.2.0
  - `iblokz-snabbdom-helpers` 1.2.0

### Build System
- **Browserify** with HMR (Hot Module Replacement)
- **node-sass** for SASS compilation
- **Bourbon/Neat** SASS frameworks
- **Watchify** for development
- Custom asset pipeline with `bin/move-assets.js`

### Project Structure

```
src/
├── js/
│   ├── index.js              # Main entry point
│   ├── actions/              # State actions
│   │   ├── counter/
│   │   └── level/
│   ├── services/             # Core services
│   │   ├── audio/            # Audio system
│   │   ├── control/          # Input controls
│   │   ├── scene/            # 3D scene management
│   │   │   ├── index.js
│   │   │   ├── camera.js     # Camera controller
│   │   │   ├── character.js  # Player character
│   │   │   ├── npcs.js       # NPC/guard AI
│   │   │   └── level.js      # Level loading
│   │   └── viewport.js       # Window/screen management
│   ├── ui/                   # UI components
│   └── util/                 # Utilities
│       ├── app.js            # Custom state adapter
│       ├── keyboard.js       # Keyboard input
│       ├── gamepad.js        # Gamepad support
│       ├── midi.js           # MIDI input
│       ├── time.js           # Animation frame management
│       ├── audio/            # Audio utilities
│       └── three/            # Three.js utilities
│           └── loader/       # Model loaders (GLTF, Collada, FBX, OBJ)
├── sass/                     # Stylesheets
└── assets/                   # Static assets
    ├── models/               # 3D models (rogue, guard, trees, etc.)
    ├── samples/              # Audio samples
    ├── skybox/               # Skybox textures
    └── textures/             # Ground/wall textures
```

## Game Features Implemented

### Player Character
- **3D Model**: Rogue character with skeletal animation
- **Animations**: 
  - Idle (2 variations)
  - Walking
  - Crouching
- **Movement**: WASD/Arrow keys with variable speed (Shift/C modifiers)
- **Rotation**: Mouse-based camera-relative rotation
- **Position**: Dynamic 3D position tracking

### Camera System
- **3rd Person Following**: Tracks player position
- **Mouse Control**: Click-and-drag rotation
- **Dynamic Distance**: Adjusts based on camera angle (12-60 units)
- **Zoom**: Mouse wheel support
- **Angle Constraints**: Vertical angle limited (170-260 degrees)

### NPC/Guard AI
- **Patrol Routes**: 3 guards with predefined waypoint paths
- **States**: Idle and walking modes
- **Animations**: Smooth transitions between idle/walk
- **Path Following**: Automatic waypoint navigation
- **Model**: Guard character with animations

### Level/Environment
- **Procedural Grid**: Tile-based level from map data
- **Props**: Lamps, benches, trees loaded from Collada/DAE files
- **Skybox**: Multiple skybox options (darkskies, lmcity, met, etc.)
- **Lighting**: 
  - Directional light with shadows
  - Shadow mapping (1024x1024)
- **Materials**: MeshToonMaterial for cel-shaded look

### Input Systems
- **Keyboard**: Full keyboard mapping with aliases
- **Mouse**: Position tracking, click detection, wheel events
- **Gamepad**: Partial gamepad support implemented
- **MIDI**: MIDI input support (unusual for a game!)

### State Management
- Custom reactive architecture using `util/app.js`
- `adapt()` function converts action trees to observables
- State tree includes:
  - Camera settings (distance, range, follow mode)
  - Player state (position, rotation, crouching, combat)
  - Viewport (screen size, mouse position)
  - Controls (enabled flags)
  - Level data

### Audio System
- Web Audio API integration
- Modular rack system (VCO, VCF, VCA, LFO)
- ADSR envelope support
- Reverb effects
- Sampler with audio file loading

## Assets

### 3D Models
- **Character Models**: Rogue (player), Guard (NPCs)
- **Props**: Lamps, benches, trees (3 variations)
- **Formats**: GLB, GLTF, FBX, Collada (DAE), OBJ
- **Source Files**: Blender files included (`.blend`)

### Audio
- Ambient sounds
- Sound effects (drop, switch, glitch)
- Clock loop

### Textures
- Bark textures (normal, color maps)
- Leaf textures with alpha
- Ground and tile textures
- Urban bench textures

## Code Quality Observations

### Strengths
- Well-organized service architecture
- Proper separation of concerns
- Hot module replacement support
- Comprehensive input handling
- Good use of reactive patterns

### Technical Debt
- Old dependency versions (RxJS 4.x)
- Legacy state management approach
- Outdated build tools (Browserify)
- Three.js r100 (several years old)
- Mixed module patterns

## Development Workflow (Pre-Migration)

### Build Commands
```bash
npm run build         # Full build
npm run build:js      # Browserify bundle
npm run build:sass    # SASS compilation
npm run build:assets  # Copy assets
npm run watch         # Watch mode with HMR
npm run start         # Build + serve + watch
```

### Development Server
- **serve** package serving from `dist/`
- LiveReload for CSS changes
- HMR for JavaScript modules

## Next Steps Identified

1. **Modernize Dependencies**
   - Migrate to RxJS 7.x
   - Update iblokz libraries
   - Use iblokz-state for state management

2. **Build System Upgrade**
   - Switch to Parcel 2.x
   - Remove Browserify/Watchify
   - Drop Bourbon/Neat (not needed)
   - Migrate to pnpm

3. **Future Enhancements**
   - Upgrade Three.js to recent version
   - Implement collision detection
   - Add stealth mechanics (vision cones, detection)
   - Expand combat system
   - Level editor/loader

## Conclusion

The project demonstrates a solid foundation for an immersive sim-style game with good architectural patterns. The codebase is clean and well-structured, making it an excellent candidate for modernization. The use of reactive programming with RxJS and the service-based architecture shows thoughtful design decisions. With the planned migration to modern tooling, this project will be well-positioned for continued development.

