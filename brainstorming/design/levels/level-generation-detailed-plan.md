# Level Generation - Detailed Planning & Resources

*Date: 2025-11-30*

## Two Level Types

### Type 1: Outdoor Compound / Urban Area
**Inspirations**: Deus Ex Liberty Island, Syndicate, GTA 1/2

**Characteristics**:
- Open area with multiple buildings
- Streets/pathways connecting structures
- Outdoor cover (crates, cars, trees)
- Multiple entry points per building
- Guard patrols between buildings
- Suitable for both 3rd person and top-down view
- Objectives spread across compound

**Key Elements**:
- Building placement (procedural or template-based)
- Street/path generation
- Outdoor asset distribution
- Multi-building patrol routes
- Line of sight considerations

### Type 2: Interior Building / Facility
**Inspirations**: Oni, Modern Deus Ex (Human Revolution/Mankind Divided)

**Characteristics**:
- Corridors and rooms
- Vertical elements (stairs, vents, elevators)
- Tight spaces emphasize close combat
- Cover more critical
- Lighting plays bigger role
- Better for 3rd person view
- Objectives within facility

**Key Elements**:
- Room connectivity
- Corridor layouts
- Vertical traversal
- Chokepoints and flanking routes
- Interior decoration density

## Iteration & Visualization Tools

### Option 1: HTML Canvas Debug Visualizer
**Quick to implement, runs in browser**

```javascript
// Add to UI for debugging
const drawLevelDebug = (ctx, level, guards) => {
  // Draw grid
  level.map.forEach((row, y) => {
    row.forEach((tile, x) => {
      ctx.fillStyle = tile === 0 ? '#2a4' : '#888';
      ctx.fillRect(x * 10, y * 10, 10, 10);
    });
  });
  
  // Draw assets
  level.assets.forEach((row, y) => {
    row.forEach((asset, x) => {
      if (asset > 0) {
        ctx.fillStyle = ['#ff0', '#f80', '#0f0', '#0ff', '#00f'][asset - 1];
        ctx.fillRect(x * 10 + 2, y * 10 + 2, 6, 6);
      }
    });
  });
  
  // Draw guard routes
  guards.forEach((guard, i) => {
    ctx.strokeStyle = `hsl(${i * 120}, 70%, 50%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    guard.route.forEach((waypoint, j) => {
      const x = (waypoint[0] / 5 + 9.5) * 10;
      const y = (waypoint[2] / 5 + 14.5) * 10;
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });
};
```

### Option 2: ASCII Art Generator
**Fast iteration in terminal/text file**

```
# = wall (pavement)
. = grass
L = lamp
T = tree
G = guard waypoint
P = player spawn

####################
#..................#
#..T...L.....T.....#
#..................#
#.....G---G........#
#.........|........#
#.....G---G........#
#..................#
####################
```

### Option 3: Minimap as Design Tool
**Leverage existing minimap for visualization**

- Generate level
- Spawn at center
- Minimap shows full layout
- Guards visible with routes
- Iterate until it looks good
- Screenshot for reference

### Option 4: Export to Image
**Generate PNG for sharing/discussion**

```javascript
// Use node-canvas or html2canvas
const exportLevelPNG = (level) => {
  // Render to canvas
  // Save as PNG
  // Include metadata (seed, params)
};
```

### Option 5: JSON Diff Tool
**Compare generations**

```bash
# Save generated levels
level-seed-12345.json
level-seed-67890.json

# Visual diff
diff -u level-*.json | colordiff
```

## Recommended Iteration Workflow

### Phase 1: Rapid Prototyping (2D Canvas)
1. Create `src/js/util/levelDebugger.js`
2. Add debug canvas to UI (toggle with 'L' key)
3. Generate → Visualize → Iterate
4. Save good seeds to `levels/seeds.json`

### Phase 2: Parameter Tuning
1. Add UI sliders for parameters
2. Real-time regeneration
3. Find sweet spots for each parameter
4. Document findings

### Phase 3: 3D Validation
1. Load generated level in 3D
2. Test playability
3. Check guard routes
4. Verify sight lines

### Phase 4: Refinement
1. Add validation rules
2. Implement rejection sampling (regenerate if bad)
3. Build template library
4. Hybrid: procedural + hand-tuned

## Procedural Generation Resources

### Articles & Guides

#### General PCG Theory
- **"Procedural Content Generation in Games"** (Book)
  http://pcgbook.com/
  - Comprehensive textbook, free online
  - Chapter 3: Search-based PCG
  - Chapter 4: Constructive methods

- **Shaping Worlds with Math**
  https://www.redblobgames.com/
  - Amit Patel's amazing interactive guides
  - Grid algorithms, pathfinding, generation

- **"So You Want to Build a Generator"** by Kate Compton
  https://galaxykate0.tumblr.com/post/139774965871/so-you-want-to-build-a-generator
  - Practical advice from Tracery creator
  - Iteration strategies

#### Level Generation Specific
- **"Dungeon Generation in Binding of Isaac"**
  https://www.boristhebrave.com/2020/09/12/dungeon-generation-in-binding-of-isaac/
  - Room templates + graph connections
  - Detailed breakdown

- **"Procedural Level Generation in Games Tutorial"**
  https://www.gamedeveloper.com/programming/procedural-level-generation-in-games-tutorial
  - Multiple approaches compared
  - Code examples

- **"How to Make Roguelike Levels"**
  https://www.gridsagegames.com/blog/2014/06/procedural-map-generation/
  - Various algorithms visualized
  - Cellular automata, BSP, etc.

#### Specific Algorithms

**Cellular Automata**
- **"Cellular Automata Method for Generating Random Cave-Like Levels"**
  https://www.roguebasin.com/index.php/Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
  - Step-by-step guide
  - JavaScript examples

**Wave Function Collapse**
- **"Wave Function Collapse Explained"**
  https://robertheaton.com/2018/12/17/wavefunction-collapse-algorithm/
  - Clear explanation with examples
  - Good for tile-based generation

- **WaveFunctionCollapse GitHub** by Maxim Gumin
  https://github.com/mxgmn/WaveFunctionCollapse
  - Original implementation
  - Tons of examples

**Binary Space Partitioning (BSP)**
- **"Dungeon Generation using BSP Trees"**
  https://eskerda.com/bsp-dungeon-generation/
  - Interactive demo
  - Good for rectangular rooms

**Graph-Based (Room Templates)**
- **"Spelunky Level Generation"**
  https://tinysubversions.com/spelunkyGen/
  - Darius Kazemi's detailed analysis
  - Room templates + critical path

### Video Resources

#### GDC Talks

**"Procedural World Generation of Far Cry 5"** (GDC 2018)
https://www.youtube.com/watch?v=NfizT369g60
- Outdoor area generation
- Roads, buildings, vegetation

**"Dungeon Generation in Enter the Gungeon"** (GDC 2016)
https://www.youtube.com/watch?v=Hsw3y-Mb3vA
- Room-based approach
- Quality control methods

**"Automated Playtesting in Galak-Z"** (GDC 2015)
https://www.youtube.com/watch?v=zVVJ8VbkUes
- Validation techniques
- Difficulty balancing

**"Level Design in a Day: Procedural Patterns"** (GDC 2017)
https://www.youtube.com/watch?v=xHSRigHw5so
- Procedural + handcrafted hybrid
- Pattern libraries

#### Tutorial Series

**Sebastian Lague - Procedural Cave Generation**
https://www.youtube.com/watch?v=v7yyZZjF1z4
- Unity but concepts apply anywhere
- Cellular automata in depth
- Marching squares for mesh generation

**Coding Adventures - Procedural Terrain**
https://www.youtube.com/watch?v=wbpMiKiSKm8
- Noise-based generation
- Chunking and optimization

### Interactive Tools & Demos

**Dungeon Scrawl** (Browser-based dungeon generator)
https://dungeonscrawl.com/
- Inspect output for inspiration
- See what "good" looks like

**procgen.space** (PCG examples)
http://www.procgen.space/
- Collection of generators
- Source code available

**Cave Generator** by Michael Cook
http://www.aigamedev.com/open/tutorial/cave-generation/
- Interactive cellular automata
- Tweak parameters live

## Specific Recommendations for Your Game

### For Outdoor Compound (Type 1)

**Approach**: Building Placement + Street Generation

1. **Define building templates**
   ```javascript
   {
     type: 'warehouse',
     size: {w: 20, h: 15},
     entrances: [{x: 10, y: 0}, {x: 0, y: 7}],
     interior: 'procedural' | 'template',
     coverPoints: [...],
     guardSpawns: [...]
   }
   ```

2. **Place buildings on grid** (poisson disc sampling for spacing)
   - https://www.jasondavies.com/poisson-disc/
   - Ensures minimum distance between buildings

3. **Generate streets** connecting buildings
   - A* pathfinding between entrances
   - Widen paths to street width
   - Add pavement tiles

4. **Fill with assets**
   - Trees in grass areas
   - Lamps along streets
   - Crates near buildings
   - Cover in open spaces

5. **Generate patrol routes**
   - Graph of street intersections
   - Guards patrol segments
   - Overlap coverage

**Resources**:
- "Automatic Building Placement" - https://0fps.net/2018/03/03/a-level-generator-for-plazas/
- "Road Generation" - https://web.archive.org/web/20161022111537/http://www.tmwhere.com/city_generation.html

### For Interior Building (Type 2)

**Approach**: Room Templates + BSP or Graph

1. **Create room templates** (5-10 types)
   - Office, corridor, server room, security, storage
   - Entry/exit points marked
   - Cover positions defined
   - Size variants (small/medium/large)

2. **Generate structure**
   - Option A: BSP tree (rectangular rooms)
   - Option B: Graph (Spelunky-style)
   - Ensure connectivity

3. **Place corridors**
   - Connect rooms
   - T-junctions and corners
   - Width variation

4. **Add vertical elements**
   - Stairs between floors
   - Vents (alternate routes)
   - Elevators (set pieces)

5. **Populate**
   - Guards at chokepoints
   - Cover in rooms
   - Objectives in hard-to-reach areas

**Resources**:
- "Procedural Dungeon Generation" - https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/
- Bob Nystrom's detailed algorithm comparison

## Implementation Strategy

### Week 1: Visualization Tools
- [ ] Add debug canvas to UI
- [ ] Implement ASCII export
- [ ] Create seed management system
- [ ] Build parameter UI (sliders)

### Week 2: Outdoor Compound Generator
- [ ] Define building templates (JSON)
- [ ] Implement poisson disc sampling
- [ ] Street/path generation
- [ ] Asset placement algorithm
- [ ] Guard route generation

### Week 3: Testing & Refinement
- [ ] Generate 100 levels
- [ ] Playtest top 10
- [ ] Identify failure modes
- [ ] Add validation rules
- [ ] Tune parameters

### Week 4: Interior Generator (Optional)
- [ ] Room templates
- [ ] BSP or graph connector
- [ ] Corridor generation
- [ ] Vertical elements
- [ ] Test connectivity

## Quick Start: Tonight's Session

Want to build the **visualizer first**? We could:

1. **Add debug canvas** (30 min)
   - Toggle with 'L' key
   - Shows current level in 2D
   - Displays guard routes

2. **Add seed input** (15 min)
   - UI input for seed
   - Regenerate button
   - Save/load seeds

3. **Simple randomizer** (45 min)
   - Randomize asset placement
   - Keep same grid structure
   - Use seeded RNG

Then we can **see** what we're generating and iterate much faster!

## Questions to Decide

1. **Start with outdoor or indoor?**
   - Outdoor is more complex (buildings, streets)
   - Indoor is more constrained (rooms, corridors)
   - Your call!

2. **Hand-author templates or fully procedural?**
   - Templates = faster, more control
   - Fully procedural = more variety, less predictable
   - Hybrid = best of both?

3. **How much variety vs. quality control?**
   - Wide random = more failures
   - Constrained = safer but repetitive
   - Validation = regenerate until good?

4. **Difficulty progression?**
   - Linear (mission 1 → 10)
   - Player choice (easy/med/hard)
   - Adaptive (based on performance)

## My Recommendation

**Tonight**: Build the visualization tools
**This Weekend**: Implement outdoor compound generator
**Next Week**: Playtest and refine

Start with Type 1 (outdoor) because:
- Matches your current level style
- Liberty Island is iconic for Deus Ex fans
- Easier to iterate (no vertical complexity)
- Can add buildings incrementally

What do you think? Want to start with the visualizer?

