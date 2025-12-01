# World Structure & Map System

**Core Concept**: Diablo-style hub + procedural dungeons  
**Inspirations**: Diablo I/II, Deus Ex, GTA

## Two-Zone System

### Zone Type 1: Safe Zones (Static)
**Like**: Diablo towns, GTA safe houses, Deus Ex hubs

#### Purpose
- **Safe area** - No combat, no alerts
- **NPC interaction** - Mission givers, info brokers
- **Shopping** - Weapons, augments, equipment, clothes
- **Progression** - Upgrades, skill points
- **Story** - Narrative beats, lore

#### Examples
- **Corporate District** - High-end shops, corporate NPCs
- **Underground Market** - Black market, hackers, informants  
- **Safe House** - Your base, storage, planning
- **Tech Lab** - Augment upgrades, research

#### Implementation
```javascript
zone: {
  type: 'safe',
  name: 'Underground Market',
  npcs: [
    { id: 'vendor-1', type: 'weapon-shop', position: [...] },
    { id: 'mission-1', type: 'fixer', position: [...] },
    { id: 'vendor-2', type: 'augments', position: [...] }
  ],
  exits: [
    { id: 'exit-1', destination: 'compound-1', position: [...] }
  ]
}
```

### Zone Type 2: Compounds (Procedural)
**Like**: Diablo dungeons, Syndicate missions

#### Purpose
- **Mission objectives** - Stealth, combat, objectives
- **Enemy encounters** - Guards, security, bosses
- **Loot** - Credits, equipment, data
- **Replayability** - Different layouts each time

#### Examples
- **Corporate Office** - Multi-floor building
- **Research Facility** - Labs, security checkpoints
- **Warehouse Complex** - Storage, loading docks
- **Data Center** - Server rooms, control centers

#### Procedural Elements
- **Layout** - Room arrangement, corridors
- **Enemy placement** - Patrol routes, guard positions
- **Loot spawns** - Random rewards
- **Entry/exit points** - Multiple approach vectors

## Procedural Compound Generation

### Basic Approach (Start Simple)

#### Grid-Based System
```javascript
compound: {
  size: { width: 20, height: 20 }, // Grid cells
  rooms: [
    { type: 'entrance', position: [0, 10], size: [2, 2] },
    { type: 'corridor', position: [2, 10], size: [4, 2] },
    { type: 'guard-room', position: [6, 8], size: [3, 3] },
    { type: 'objective', position: [15, 15], size: [4, 4] },
    { type: 'exit', position: [18, 10], size: [2, 2] }
  ],
  guards: [
    { route: [[5,5], [5,10], [10,10]], type: 'patrol' },
    { route: [[15,15]], type: 'static' }
  ]
}
```

#### Room Types
- **Entrance** - Start point
- **Corridor** - Connecting passages
- **Guard Room** - Enemy concentration
- **Objective Room** - Target location
- **Security Room** - Cameras, alarms
- **Exit** - Escape point

### Algorithm (Phase 1 - Simple)

1. **Define boundaries** (20x20 grid)
2. **Place entrance** (random edge)
3. **Place objective** (far from entrance)
4. **Generate path** (simple A* or random walk)
5. **Add rooms** along path
6. **Place guards** in rooms
7. **Place exit** near objective

### Algorithm (Phase 2 - Advanced)

- **BSP (Binary Space Partitioning)** - Like Diablo
- **Cellular automata** - Organic shapes
- **Pre-made templates** - Mix procedural + hand-crafted
- **Difficulty scaling** - More guards, complex layouts

## World Flow

```
Safe Zone (Static)
    ↓
  Accept Mission
    ↓
  Select Compound
    ↓
Compound (Procedural)
    ↓
  Complete Objective
    ↓
  Extract/Exit
    ↓
Safe Zone (Static)
    ↓
  Debrief
    ↓
  Shop/Upgrade
    ↓
  Accept Next Mission
```

## Implementation Priority

### Phase 1: Static Test Compound (1-2 days)
- ✅ Current level (basically done)
- Add clear objective marker
- Add entrance/exit points
- Simple "mission complete" trigger

### Phase 2: Static Safe Zone (2-3 days)
- Small hub area
- 2-3 NPC types (vendor, mission giver)
- Simple interaction (press E)
- Door to transition to compound

### Phase 3: Basic Procedural (3-5 days)
- Simple grid generator
- Random room placement
- Procedural guard placement
- Test multiple layouts

### Phase 4: Polish & Expand (ongoing)
- More room types
- Better algorithms
- Visual variety
- Difficulty scaling

## Technical Considerations

### Level Data Structure
```javascript
level: {
  type: 'compound' | 'safe',
  seed: 12345, // For procedural regeneration
  layout: {
    grid: [...], // 2D array of tile types
    rooms: [...],
    doors: [...],
    spawns: {
      player: [x, y, z],
      guards: [[x, y, z], ...],
      objectives: [[x, y, z], ...]
    }
  },
  mission: {
    type: 'assassination',
    objectives: [...],
    alertLevel: 0
  }
}
```

### Assets Needed
- **Tileset** - Floor, wall, door tiles
- **Props** - Crates, computers, desks
- **Modular pieces** - Reusable room sections

### Three.js Integration
- Generate geometry from grid
- Instance repeated elements (performance)
- Skybox per zone type
- Lighting per zone mood

## Initial Focus: Compound Generator

Let's start with **basic procedural compound** because:
1. ✅ More exciting (immediate gameplay value)
2. ✅ Tests core systems (spawning, objectives)
3. ✅ Replayability (different every time)
4. ✅ Foundation for rest of game

Safe zones can come after we have fun missions to return from!

## Next Steps

1. Design simple room templates
2. Create grid generator
3. Place rooms procedurally
4. Spawn guards in rooms
5. Add objective markers
6. Test multiple seeds

