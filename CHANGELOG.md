# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Modern build system with Parcel 2.12.0
- pnpm package manager with hoisting configuration
- `.parcelrc` configuration for static files and resolvers
- `src/index.pug` as Parcel entry point
- `iblokz-state` 1.1.0 for reactive state management
- `services/control/` - Extracted control logic into dedicated service
- `summaries/` folder for project documentation
  - Initial project discovery document
  - Dev stack migration document
- `brainstorming/` folder for design ideas
  - Camera and view systems (GTA/Syndicate inspiration)
  - Syndicate influences (missions, augments, persuasion)
  - Quick wins roadmap
- `.npmrc` for pnpm configuration

### Changed
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

### Removed
- Browserify, Watchify, browserify-hmr
- node-sass
- Bourbon and Bourbon Neat
- Custom `util/app.js` state adapter (replaced by iblokz-state)
- Livereload script (replaced by Parcel HMR)
- `bin/sass-paths.js` (no longer needed)

### Fixed
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

