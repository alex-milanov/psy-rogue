# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- **Brainstorming Organization**
  - `brainstorming/README.md` - Navigation guide for design docs
  - `brainstorming/architecture/` - Architecture patterns and decisions
  - `brainstorming/design/` - Game design documents
- **Level Generation Planning**
  - `brainstorming/design/levels/level-generation-detailed-plan.md`
    * Two level types: Outdoor compounds (Liberty Island style) & Interior facilities (Oni style)
    * Detailed algorithms for procedural generation (BSP, Voronoi, cellular automata)
    * Multi-phase implementation roadmap
    * Asset requirements and resource references (Three.js examples, kenney.nl)
  - `brainstorming/design/levels/liberty-island-mvp.md`
    * MVP scope for initial compound level
    * Multiple navigation paths (main gate, side entrance, rooftop)
    * Optional objectives and non-hostile NPC interaction
    * Asset procurement guide for outdoor environments
- **Music System Design**
  - `brainstorming/design/audio-music-system.md`
    * Three dynamic music states: Ambient, Tension, Combat
    * State transition logic based on guard detection/combat
    * Inspired by Syndicate and Deus Ex soundtracks
    * Implementation phases and asset sources (freesound.org, Incompetech, LMMS)
- **Tactical Minimap** (toggle with M key)
  - Real-time player and guard positions with facing indicators
  - Dynamic camera FOV visualization (wedge → circle transition)
  - View mode indicator (TOP-DOWN/ELEVATED/3RD PERSON)
  - 3D cone projection math for smooth FOV transitions
  - Hybrid Snabbdom UI + Canvas rendering
- **Game/Scene Architecture Separation**
  - `services/game/` - Pure game logic and guard AI
  - `services/control/camera.js` - Camera angle calculation
  - Clean state flow: Control/Game → State → Scene/Minimap
  - Guard AI with patrol routes, idle/walk states
- **Minimap Services**
  - `ui/minimap/` - Snabbdom UI container
  - `services/minimap/` - Canvas 2D rendering service
- **Debug Enhancements**
  - Player debug info in controls panel
  - Position, rotation, direction vectors
  - Camera angles and force display
- **Documentation**
  - `brainstorming/architecture/game-scene-separation.md` - Architecture pattern
  - `summaries/2025-11-30-3-minimap-and-architecture.md` - Session summary
  - Inspirations tracking (Vampire: Redemption, Syndicate, Deus Ex, GTA 3, Syndicate 1993, Diablo 1/2)
- Modern build system with Parcel 2.12.0
- pnpm package manager with hoisting configuration
- `.parcelrc` configuration for static files and resolvers
- `src/index.pug` as Parcel entry point
- `iblokz-state` 1.1.0 for reactive state management
- `services/control/` - Extracted control logic into dedicated service
- `summaries/` folder for project documentation
  - Initial project discovery document
  - Dev stack migration document
- `.npmrc` for pnpm configuration

### Changed
- **Brainstorming Structure**: Reorganized into `architecture/` and `design/` subfolders
  - Consolidated scattered brainstorming docs into organized hierarchy
  - Moved architecture patterns to dedicated folder
  - Grouped design docs by category (levels, audio, etc.)
- **Architecture**: Implemented clean game/scene/control separation
  - Scene service now purely visualizes state (no game logic)
  - Guard AI moved from scene to game service
  - Camera angle calculation moved to control service
- **Guard System**: Refactored to state-driven approach
  - Guards managed in `state.game.guards` array
  - Scene syncs 3D models to game state by ID
  - Minimap reads directly from game state
- **Camera System**: Split into control (calculation) and scene (visualization)
  - Control service handles mouse input and angle updates
  - Scene service reads `state.camera.angle` for positioning
- **Player Rotation**: Now reflects actual facing based on movement direction
  - Uses `state.player.direction` vector for accurate facing
  - Coordinate system corrections for minimap display
- **Build System**: Browserify → Parcel 2.12.0
- **Package Manager**: npm → pnpm
- **RxJS**: 4.x → 7.8.2 (complete API migration)
- **iblokz-data**: 1.2.0 → 1.6.0
- **iblokz-snabbdom-helpers**: 1.2.0 → 2.0.0
- State management now uses `iblokz-state` instead of custom `util/app.js`
- Updated all RxJS usage to v7 pipe-based operators
- Simplified HMR to handle only actions and UI
- Updated README to be more concise
- Font Awesome import path for Parcel compatibility
- Updated project summaries with latest changes

### Removed
- **Old Brainstorming Files** (consolidated into organized structure)
  - `brainstorming/camera-and-view-systems.md`
  - `brainstorming/game-scene-separation.md`
  - `brainstorming/inspirations.md`
  - `brainstorming/level-improvements-phase1.md`
  - `brainstorming/quick-wins.md`
  - `brainstorming/syndicate-influences.md`
  - `brainstorming/threejs-upgrade-plan.md`
  - `brainstorming/world-structure.md`
- Browserify, Watchify, browserify-hmr
- node-sass
- Bourbon and Bourbon Neat
- Custom `util/app.js` state adapter (replaced by iblokz-state)
- Livereload script (replaced by Parcel HMR)
- `bin/sass-paths.js` (no longer needed)

### Fixed
- **Minimap Coordinate System**: Applied -45° correction for accurate direction display
- **Camera FOV Visualization**: Smooth 3D cone projection (no more sudden transitions)
- **Guard Visualization**: Real-time position and rotation updates on minimap
- **Player Direction**: Correctly calculates facing from direction vector [x,y,z]
- RxJS Observable creation (`Observable.create` → `new Observable`)
- RxJS operators now use pipe syntax
- Observer methods (`onNext` → `next`, `onCompleted` → `complete`)
- Subscription cleanup (`dispose` → `unsubscribe`)
- Font Awesome SASS import path

### Migrated (18 files)
- `src/js/index.js` - Main entry point
- `src/js/util/` - All utility files (keyboard, time, file, midi, gamepad, image)
- `src/js/util/three/loader/` - All Three.js loaders (gltf, collada, fbx, obj)
- `src/js/services/` - All services (scene, viewport, audio)
- `src/js/services/scene/` - Scene components (camera, character, npcs, level)

### Performance
- Development builds: ~1.1s (with cache)
- Production builds: ~4.3s
- Bundle size: ~852 KB (uncompressed)
- Hot Module Replacement functional for actions and UI

## [Previous] - Pre-migration

### Stack
- Browserify + Watchify with HMR
- node-sass with Bourbon/Neat
- RxJS 4.x
- iblokz libraries 1.x
- npm package manager

