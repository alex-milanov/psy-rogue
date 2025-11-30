# Level Improvements - Phase 1

**Goal**: Enhance current level with minimap and procedural enemy placement  
**Inspiration**: virux project utilities

## From Virux Project

### Useful Utilities Found

1. **Grid System** (`util/three/grid.js`)
   - Generate grid: `generate(size)` - creates 2D array
   - Traverse grid: `traverse(grid, callback)` - iterate with position
   - Filter grid: `filter(grid, predicate)` - find cells matching criteria
   - Get area: `getArea(grid, pos, radius)` - get surrounding cells
   - Calc origin: `calcOrigin(gridSize, cellSize)` - center grid at 0,0

2. **Perlin Noise** (`util/three/perlin.js`)
   - 3D Perlin noise for natural-looking randomness
   - Seed-based for reproducibility
   - Good for terrain, density maps, spawn probability

3. **Grid-based Spawning**
   - Entities placed on grid coordinates
   - Easy collision detection
   - Predictable patrol paths

## Proposed Improvements

### 1. Minimap (Priority 1)

**What**: Top-down 2D canvas showing tactical overview

#### Implementation
```javascript
// In services/minimap/index.js
const canvas = document.createElement('canvas');
canvas.width = 200;
canvas.height = 200;
canvas.style.position = 'absolute';
canvas.style.top = '10px';
canvas.style.right = '10px';
canvas.style.border = '2px solid #00ff00';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

// Draw every frame
const render = (state) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 200, 200);
  
  // Draw player (blue)
  const playerX = mapToCanvas(state.player.position[0]);
  const playerZ = mapToCanvas(state.player.position[2]);
  ctx.fillStyle = '#00ff00';
  ctx.fillRect(playerX-2, playerZ-2, 4, 4);
  
  // Draw guards (red)
  state.guards.forEach(guard => {
    const gx = mapToCanvas(guard.position.x);
    const gz = mapToCanvas(guard.position.z);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(gx-2, gz-2, 4, 4);
  });
  
  // Draw objectives (yellow)
  // Draw props (gray outline)
};
```

**Features**:
- Player position (green dot)
- Guard positions (red dots)
- Guard facing direction (small line)
- Objective markers (yellow)
- Level boundaries
- Optional: fog of war (only show what you've seen)

**Effort**: 2-3 hours

### 2. Grid Utility (Priority 2)

Copy/adapt virux grid utilities to psy-rogue:

```javascript
// src/js/util/grid.js
const generate = (width, height) => 
  new Array(height).fill(null)
    .map(() => new Array(width).fill(null));

const traverse = (grid, cb) => 
  grid.map((row, y) =>
    row.map((cell, x) => cb({x, y}, cell))
  );

const filter = (grid, predicate) => {
  const results = [];
  traverse(grid, (pos, cell) => {
    if (predicate(pos, cell)) results.push({pos, cell});
  });
  return results;
};

const getNeighbors = (grid, pos, radius = 1) => {
  const neighbors = [];
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x === 0 && y === 0) continue;
      const nx = pos.x + x;
      const ny = pos.y + y;
      if (grid[ny] && grid[ny][nx]) {
        neighbors.push({pos: {x: nx, y: ny}, cell: grid[ny][nx]});
      }
    }
  }
  return neighbors;
};

// Convert grid position to 3D world position
const gridToWorld = (pos, cellSize = 5, origin = {x: 0, z: 0}) => ({
  x: origin.x + pos.x * cellSize,
  z: origin.z + pos.y * cellSize
});

module.exports = {
  generate,
  traverse,
  filter,
  getNeighbors,
  gridToWorld
};
```

**Effort**: 1 hour

### 3. Procedural Guard Placement (Priority 3)

**Current**: Hardcoded guard routes
```javascript
const routes = [
  [[-10, 0.2, -20], [20, 0.2, -20]],
  [[0, 0.2, 0], [-30, 0.2, 0]],
  [[-20, 0.2, 20], [10, 0.2, 20], [10, 0.2, 40]]
];
```

**Procedural**: Generate from grid + seed

```javascript
// src/js/util/level-gen.js
const { generate, filter, gridToWorld } = require('./grid');

const generateGuardPlacements = (seed = 12345, count = 3) => {
  // Create logical grid (not visual)
  const grid = generate(20, 20);
  
  // Mark some cells as "patrol zones"
  const patrolZones = [
    { center: {x: 5, y: 5}, radius: 3 },
    { center: {x: 15, y: 10}, radius: 2 },
    { center: {x: 10, y: 15}, radius: 3 }
  ];
  
  // Generate patrol routes
  const routes = patrolZones.map(zone => {
    const waypoints = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const x = zone.center.x + Math.cos(angle) * zone.radius;
      const y = zone.center.y + Math.sin(angle) * zone.radius;
      const world = gridToWorld({x, y});
      waypoints.push([world.x, 0.2, world.z]);
    }
    return waypoints;
  });
  
  return routes;
};
```

**Enhancements**:
- Random seed for different layouts
- Adjust guard count based on difficulty
- Ensure guards don't overlap patrol zones
- Vary route complexity (2-5 waypoints)

**Effort**: 2-3 hours

### 4. Procedural Prop Placement (Priority 4)

**Current**: Hardcoded asset placement from `state.level.assets`

**Procedural**: Scatter props naturally

```javascript
const generatePropPlacements = (seed, density = 0.1) => {
  const grid = generate(20, 20);
  const props = [];
  
  traverse(grid, (pos) => {
    // Use seeded random
    const random = seededRandom(seed + pos.x * 1000 + pos.y);
    
    if (random < density) {
      const world = gridToWorld(pos);
      const propType = Math.floor(random * 5); // 0-4 (lamp, bench, tree1-3)
      props.push({
        type: propType,
        position: world,
        rotation: Math.random() * Math.PI * 2
      });
    }
  });
  
  return props;
};
```

**Effort**: 2 hours

## Implementation Order

### Quick Win Path (1 day)
1. ✅ Add minimap (2-3h) - **Most visible impact**
2. ✅ Copy grid utilities (1h)
3. ✅ Procedural guard placement (2-3h)
4. Later: Procedural props

### Why This Order?
- **Minimap first** - Immediately useful, helps with testing
- **Grid utils** - Foundation for everything else
- **Guard placement** - Core gameplay element
- **Props** - Visual variety, lower priority

## Technical Notes

### State Structure for Procedural Level
```javascript
level: {
  seed: 12345,
  grid: {
    width: 20,
    height: 20
  },
  guards: [
    { route: [...], spawn: {x, y, z} },
    // ... generated
  ],
  props: [
    { type: 'lamp', position: {...}, rotation: 0 },
    // ... generated
  ]
}
```

### Minimap State
```javascript
minimap: {
  enabled: true,
  size: 200,
  zoom: 1.0,
  showFog: false,
  discovered: [[...]] // 2D array of booleans for fog of war
}
```

## Next Steps

1. Create `src/js/services/minimap/index.js`
2. Copy `src/js/util/grid.js` from virux pattern
3. Update `src/js/services/scene/npcs.js` to use procedural routes
4. Add UI control to toggle minimap (M key?)
5. Test with different seeds

Want to start with the minimap?

