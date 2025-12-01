# Procedural Level Generation - Initial Design

*Date: 2025-11-30*

## Current State Analysis

### Existing Level System
- **Grid-based**: Tiles in a 2D array (`state.level.map`)
- **Two layers**:
  - `map`: Ground tiles (0 = grass, 1 = pavement)
  - `assets`: Objects (0 = empty, 1-5 = lamp/bench/trees)
- **Fixed size**: 5x5 unit tiles
- **Static models**: Pre-placed lamps, benches, trees
- **Static guard routes**: 3 guards with hardcoded patrol paths

### Current Architecture Strengths
- Clean game/scene separation
- State-driven rendering
- Easy to add/modify grid data
- Models loaded and cloned efficiently

## Proposed Approach: Hybrid System

Based on Diablo/Syndicate inspiration:

### Phase 1: Compound Generator (Short-term)
**Goal**: Procedurally generate enemy compounds while keeping safe zones static

**What to Generate**:
1. **Layout Structure**
   - Outer walls/perimeter
   - Interior rooms/corridors
   - Entry/exit points
   - Cover positions (crates, barriers)

2. **Guard Placement**
   - Number of guards based on difficulty
   - Patrol routes connecting key areas
   - Static guard positions (snipers, sentries)
   - Overlapping patrol coverage

3. **Environmental Elements**
   - Light sources (affects stealth)
   - Objects for cover
   - Elevation variations (platforms, stairs)
   - Objective locations

**Generation Parameters**:
```javascript
{
  difficulty: 1-5,
  size: 'small' | 'medium' | 'large',
  layout: 'courtyard' | 'warehouse' | 'facility' | 'compound',
  guardCount: number,
  coverDensity: 'sparse' | 'normal' | 'dense',
  objective: 'infiltrate' | 'retrieve' | 'eliminate' | 'sabotage'
}
```

### Phase 2: Room-Based Generation (Mid-term)
**Inspiration**: Binding of Isaac, Enter the Gungeon

**Approach**:
- Pre-designed room templates (5-10 initial rooms)
- Rooms connect via doorways/corridors
- Each room has:
  - Entry/exit points
  - Cover placement zones
  - Guard spawn points
  - Objective markers
- Procedurally connect rooms into compound layout

**Room Types**:
- Entry courtyard
- Patrol corridor
- Guard station
- Storage/warehouse
- Server room (objectives)
- Rooftop/elevated area

### Phase 3: Full Procedural (Long-term)
- Terrain generation
- Building placement
- Multi-story structures
- Dynamic objective generation

## Implementation Strategy

### Step 1: Level Generator Service
Create `services/game/levelGenerator.js`

**Responsibilities**:
- Generate grid data (`map`, `assets`)
- Calculate guard patrol routes
- Place objective markers
- Return level state object

**Example**:
```javascript
const generateCompound = (params) => {
  return {
    map: [...],      // Ground tiles grid
    assets: [...],   // Objects grid
    guards: [...],   // Guard configs with routes
    objectives: [...], // Mission objectives
    spawn: {x, y, z},  // Player spawn point
    exit: {x, y, z}    // Exit point
  };
};
```

### Step 2: Start Simple - Expand Current Map
**Quick Win**: Add randomization to existing system

1. **Randomize asset placement**
   - Keep perimeter fixed
   - Randomize trees/benches/lamps within zones
   - Ensure paths remain clear

2. **Randomize guard routes**
   - Define patrol waypoint zones
   - Generate random routes connecting zones
   - Ensure coverage and variety

3. **Add difficulty scaling**
   - More guards at higher difficulties
   - Faster patrol speeds
   - Better coverage patterns

### Step 3: Cellular Automata for Layouts
**Technique**: Generate organic compound layouts

```javascript
// Cellular automata rules for compound generation
1. Initialize grid with random walls (40-60% density)
2. Apply rules:
   - If cell has <2 wall neighbors: become empty
   - If cell has >4 wall neighbors: become wall
   - Repeat 3-5 iterations
3. Identify largest open area as main compound
4. Add perimeter walls
5. Place guards in strategic positions
```

### Step 4: Patrol Route Generation
**Algorithm**: A* / Waypoint Graph

1. **Define patrol zones**: Areas guards should cover
2. **Generate waypoint graph**: Key positions in compound
3. **Create patrol loops**: Connect waypoints into routes
4. **Ensure coverage**: All areas patrolled or watched
5. **Add variety**: Random timing, different routes

## Best Practices

### 1. Seed-Based Generation
- Use seed for reproducible levels
- Same seed = same level
- Players can share/replay interesting levels

### 2. Validation
- Ensure player can reach objective
- Verify paths are clear
- Check guard routes don't clip geometry
- Validate difficulty matches parameters

### 3. Progressive Disclosure
- Start with small, simple compounds
- Increase complexity as player progresses
- Tutorial missions use simpler layouts

### 4. Playtesting Hooks
- Debug mode to visualize:
  - Guard sight lines
  - Patrol routes
  - Cover positions
  - Optimal stealth paths
- Save/load generated levels for testing

## Inspirations Applied

### From Syndicate (1993)
- **Mission structure**: Each compound is a discrete mission
- **Agent upgrades**: Difficulty scales with player capabilities
- **Urban setting**: Industrial/corporate compounds
- **Top-down tactical view**: Minimap shows full layout (if scouted)

### From Deus Ex
- **Multiple approaches**: Stealth, combat, or hybrid
- **Environmental storytelling**: Compound layout hints at function
- **Objectives**: Not just "kill everyone" - retrieve, sabotage, escape

### From Diablo
- **Static hub**: Safe zone for prep/upgrades
- **Randomized dungeons**: Each compound procedurally generated
- **Loot/rewards**: Successful missions yield resources

### From Binding of Isaac
- **Room templates**: Pre-designed, procedurally connected
- **Enemy patterns**: Guards have predictable but varied behavior
- **Risk/reward**: Optional objectives for better rewards

## Proposed First Implementation

### "Quick Win" Approach
**Goal**: Add procedural elements without rewriting everything

1. **Asset Randomization** (1-2 hours)
   - Keep current `state.level.map` structure
   - Randomize `assets` array placement
   - Add `seed` parameter for reproducibility

2. **Guard Route Variation** (2-3 hours)
   - Generate random waypoints within zones
   - Calculate routes using current patrol logic
   - Scale guard count with difficulty

3. **Difficulty Parameter** (1 hour)
   - Add to `state.game`
   - Affects guard count, speed, sight range
   - Display on UI

**Estimated Total**: 4-6 hours for playable procedural compounds

### Next Phase: Room Templates
- Design 3-5 room templates
- Create connection algorithm
- Implement in a weekend

## Technical Considerations

### Performance
- Generate on mission start (loading screen)
- Cache generated layout
- Don't regenerate every frame

### State Management
- Store generation parameters in `state.level.generation`
- Allow regeneration with new seed
- Save interesting seeds for later

### Testing
- Unit tests for generation algorithms
- Validation tests (reachability, coverage)
- Visual debugging tools

### Architecture Fit
```
Mission Start →
  Game Service (generateCompound) →
    state.level = {...generated data}
      ↓
  Scene Service reads state → Renders 3D
  Minimap Service reads state → Shows layout
```

Clean separation maintained!

## Questions to Consider

1. **How complex should rooms be?**
   - Start simple (rectangular), add complexity later

2. **How many guard types?**
   - Start with patrol guards, add stationary/snipers later

3. **Objectives per mission?**
   - 1 primary, 0-2 optional to start

4. **Should we hand-author some compounds?**
   - Yes, for tutorials and key story missions

5. **Difficulty progression?**
   - Linear? Branching? Player choice?

## Next Steps

Would you like to:
1. **Start with "Quick Win"**: Asset randomization + guard variation
2. **Build room template system**: More structured approach
3. **Prototype cellular automata**: Organic layout generation
4. **Design room templates first**: Content before algorithms
5. **Something else?**

My recommendation: **Start with Quick Win** - get procedural elements working in your current system, then iterate based on what feels fun!

