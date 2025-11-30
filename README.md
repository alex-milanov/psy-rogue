# Psy Rogue

A web-based 3rd person stealth/action game prototype inspired by **Deus Ex** and **Oni**.

## Tech Stack

- **Three.js** r100 - 3D rendering
- **RxJS** 7.8 - Reactive state management
- **Snabbdom** - Virtual DOM
- **Parcel** 2 - Build tool
- **pnpm** - Package manager

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm start

# Build for production
pnpm build
```

Dev server runs at `http://localhost:1234`

## Controls

- **WASD** / **Arrow Keys** - Move
- **Shift** - Walk (slower)
- **C** - Crouch
- **Mouse Drag** (on canvas) - Rotate camera
- **Mouse Wheel** - Zoom

## Features

- 3rd person camera system
- Character with walk/crouch animations
- NPC guards with patrol routes
- Cel-shaded graphics with outlines
- Hot module replacement

## Documentation

See `summaries/` folder for detailed project notes and migration history.

## License

MIT
