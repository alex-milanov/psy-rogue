# Procedural Level Integration

## Overview
Integrated procedural level generation into the game state system. Level data now lives in `state.level` and services react to it.

## Implementation

### 1. Level Generation Utilities (`src/js/util/levelGen.js`)
- `generatePerimeter()` - Creates perimeter walls with gate
- `generateBuildings()` - Places buildings with overlap detection
- `generatePathways()` - Creates pathway network
- `generateProps()` - Places trees, lamps, benches
- `generateGuards()` - Sets up guard positions and patrol routes
- **`generateCompound(options)`** - Main generator function

### 2. Debug Utilities (`src/js/util/levelGenDebug.js`)
- `toJSON()` - Export level as JSON
- `toASCII()` - ASCII map visualization
- `toSummary()` - Text summary with stats
- `runTests()` - Test different configurations

### 3. Actions (`src/js/actions/index.js`)
- **`loadLevel(levelData)`** - Loads level data into state, initializes guards and player position
- **`generateLevel(options)`** - Generates procedural level and loads it
- Level data added to initial state: `state.level`

### 4. Scene Service (`src/js/services/scene/level.js`)
- **`init()`** - Detects level format (grid vs procedural)
- **`initProceduralLevel()`** - Renders procedural compound levels
  - Perimeter walls
  - Hollow buildings (4 walls + roof)
  - Ground plane
  - Props (trees, lamps with lights, benches)
- **`initGridLevel()`** - Renders old grid-based levels (backward compatible)

### 5. UI Controls (`src/js/ui/controls/index.js`)
- Added "Level Controls" panel
- Button to load procedural level
- Shows current level name
- Grid tile info only shown for grid-based levels

## Usage

### Test Generator (Terminal)
```bash
node test-level-gen.js
```

### In-Game
1. Open controls panel (toggle with C)
2. Click "Load Procedural Level" button
3. New compound will generate and load

### Programmatically
```javascript
// Generate and load
actions.generateLevel({
  size: 120,
  buildingCount: 3,
  density: 1.0
});

// Or load existing level data
actions.loadLevel(levelData);
```

## Level Data Format

### Procedural Format
```javascript
{
  id: 'compound-xxx',
  name: 'Compound Alpha',
  size: 120,
  perimeter: {walls: [...], gate: {...}},
  buildings: [{id, pos, size, height, type}],
  pathways: [{pos, size, orientation}],
  props: {trees: [...], lamps: [...], benches: [...]},
  guards: [{id, startPos, type, rotation/route}],
  objective: {pos, type},
  playerStart: {pos, rotation},
  lighting: {...}
}
```

### Grid Format (Legacy)
```javascript
{
  map: [[0,1,0...], ...],  // 2D tile grid
  assets: [[0,1,2...], ...]  // 2D asset grid
}
```

## Features
- ✅ Backward compatible with existing grid-based levels
- ✅ Automatic format detection
- ✅ Guard AI initialized from level data
- ✅ Player spawn from level data
- ✅ Props with proper lighting (lamps)
- ✅ Hollow buildings with doors
- ✅ Safe entry zone (no guards near gate)
- ✅ Multiple paths to objective

## Next Steps
1. Test in-game with "Load Procedural Level" button
2. Refine generation parameters
3. Add more building variety
4. Add interior access (doors that work)
5. Add level persistence/save system

