# Liberty Island Style Level - MVP Specification

*Date: 2025-11-30*  
*Type*: Outdoor Compound (Type 1)

## Core Concept

A small corporate/government compound with multiple navigation paths, optional objectives, and NPC interaction. Think "Baby Liberty Island" - establishing the pattern that scales up later.

## MVP Scope: "The Compound"

### Overview
A secure facility with 2-3 accessible buildings, perimeter patrol, and multiple infiltration routes.

**Size**: ~40x40 tiles (200m x 200m) - slightly larger than current level  
**Mission Time**: 5-10 minutes  
**Difficulty**: Tutorial/Easy  

## Layout Structure

### Buildings (Exterior Only for MVP)

#### 1. Main Administration Building
**Size**: 15x10 tiles (3 stories visually)  
**Purpose**: Primary objective location  
**Features**:
- Front entrance (guarded)
- Side service entrance (less guarded)
- Roof access (via external stairs)
- Windows (visual only in MVP, later breakable)

#### 2. Security Checkpoint / Guard Station
**Size**: 8x5 tiles (1 story)  
**Purpose**: Gate control, optional objective  
**Features**:
- Main gate control
- Guard spawn point
- Optional intel location
- Connects to perimeter fence

#### 3. Storage/Maintenance Shed
**Size**: 6x6 tiles (1 story)  
**Purpose**: Alternative route  
**Features**:
- Unlocked back door
- Vent access to main building
- Some cover objects inside

### Outdoor Areas

#### A. Front Approach (Main Path)
- **Paved road** from spawn to main gate
- **Guard checkpoint** - 1 stationary guard
- **Cover**: Concrete barriers, planters
- **Lighting**: Street lamps (affects stealth)
- **Risk/Reward**: Direct but most guarded

#### B. Side Path (Stealth Route)
- **Grass/dirt** path along perimeter fence
- **Natural cover**: Trees, bushes
- **Patrol route**: 1 guard walks this path
- **Risk/Reward**: Slower but less exposed

#### C. Back Area (Alternative Entry)
- **Service area** with crates and equipment
- **Maintenance shed** access
- **Less lighting**
- **Patrol route**: 1 guard, longer intervals
- **Risk/Reward**: Safest approach, requires navigation

#### D. Perimeter Fence
- **Chain-link fence** with gaps (can squeeze through)
- **Patrol route**: Guards walk outside/inside
- **Breach points**: 2-3 spots with gaps
- **Cover near fence**: Vegetation, dumpsters

## Mission Structure

### Primary Objective
**"Retrieve the Data Terminal"**
- Located on 2nd floor of Administration Building
- Must reach marker and "interact" (press E)
- Extract via designated exit point

### Optional Objectives

#### 1. Obtain Security Codes
**Location**: Guard Station  
**Reward**: Unlocks side entrance to Admin Building  
**Risk**: Must get past guards or find key

#### 2. Avoid Detection
**Goal**: Complete mission without raising alarm  
**Reward**: Bonus points/rating  
**Challenge**: Requires stealth path usage

#### 3. Talk to Informant
**Location**: Maintenance Shed  
**Reward**: Intel about guard patrol patterns (shows on minimap)  
**Interaction**: First NPC encounter

## Navigation Paths

### Path 1: Direct Assault (Combat)
1. Spawn → Front road
2. Eliminate checkpoint guard
3. Enter main gate
4. Fight through to Admin Building
5. Climb stairs to objective
6. Extract via front

**Pros**: Fastest if skilled  
**Cons**: Most dangerous, raises alarm

### Path 2: Stealth Infiltration
1. Spawn → Side path (grass)
2. Use trees for cover
3. Wait for patrol gap
4. Breach fence at side
5. Enter via maintenance shed
6. Vent to Admin Building
7. Retrieve objective quietly
8. Extract via back

**Pros**: Safest, no alarm  
**Cons**: Slower, requires patience

### Path 3: Hybrid (Social Engineering)
1. Spawn → Front approach
2. Talk to Informant (optional)
3. Learn patrol patterns
4. Get security codes from Guard Station
5. Use side entrance (now unlocked)
6. Minimize combat
7. Extract via front

**Pros**: Balanced, uses multiple mechanics  
**Cons**: Requires optional objectives

## NPC Design

### Character: "Agent Marks" (Friendly Informant)
**Location**: Inside Maintenance Shed  
**Purpose**: Tutorial for NPC interaction, provides intel

**Interaction**:
```
[Press E to Talk]

Agent Marks:
"You're the new recruit? About time.
The guards rotate every 90 seconds through the side path.
If you need to get in quietly, wait by the fence breach at the back.
Guard Station has codes that'll open the side entrance.
Your call how you want to play this. Good luck."

[Optional: Show patrol routes on minimap for 60 seconds]
```

**Visual**: Reuse guard model with different color/material (gray suit vs. black)

**Implementation**:
- Simple trigger zone + UI prompt
- Dialog box overlay
- One-time interaction
- Updates minimap temporarily

## Current Assets → MVP Assets

### Already Have
✅ Grass/pavement tiles  
✅ Trees (cover)  
✅ Lamps (lighting)  
✅ Benches (decorative)  
✅ Guard models with patrol  
✅ Player character with crouch

### Need to Add

#### Critical (Must Have)
1. **Building Models** (Simple boxes to start)
   - Admin Building: 15x10x3 stories (can be 3 stacked boxes)
   - Guard Station: 8x5x1 story
   - Maintenance Shed: 6x6x1 story
   - Windows/doors as textures initially

2. **Fence Model**
   - Chain-link texture on planes
   - ~8ft height
   - Repeatable section

3. **Cover Objects**
   - Concrete barriers (traffic barriers)
   - Crates (wood boxes, various sizes)
   - Dumpster
   - Equipment (generators, AC units)

4. **Entrance/Exit Markers**
   - Glowing outline or arrow
   - "Press E to Enter" prompt
   - Objective marker (floating icon)

#### Nice to Have (Can Add Later)
5. **Vehicles** (Static, for atmosphere)
   - Parked car or two
   - Security van near guard station

6. **More Vegetation**
   - Bushes (smaller than trees, still cover)
   - Flower planters

7. **Signage**
   - Building labels
   - Warning signs
   - Directional arrows

8. **Lighting Improvements**
   - Spotlights on buildings
   - Window light glow
   - Security light cones

## Asset Sources / Creation Strategy

### Option 1: Existing Free Assets
**Low Poly Asset Packs** (many on itch.io, Sketchfab)
- Search: "low poly building pack"
- Search: "industrial props"
- Search: "urban environment"
- License: CC0 or Public Domain

**Recommended Packs**:
- Kenney.nl - "City Kit" (free, CC0)
- Quaternius - Various packs (free, CC0)
- Kay Lousberg - Low poly assets (free)

### Option 2: Simple Modeling (Blender)
**For MVP, primitives work**:
- Buildings: Scaled cubes with window texture
- Fence: Planes with chain-link material
- Crates: Cubes with wood texture
- Barriers: Cylinders stretched

**Time**: ~2 hours for all critical assets

### Option 3: Procedural (Three.js)
**Generate in code**:
```javascript
// Simple building generator
const createBuilding = (w, h, stories) => {
  const geometry = new THREE.BoxGeometry(w, stories * 3, h);
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    map: windowTexture // Repeating windows
  });
  return new THREE.Mesh(geometry, material);
};
```

**Pros**: No external assets needed  
**Cons**: Less detailed, more code

## Implementation Phases

### Phase 1: Layout Foundation (2-3 hours)
**Goal**: Walkable compound with buildings

- [ ] Expand level grid to 40x40
- [ ] Define building footprints in `level.map`
- [ ] Add fence line to `level.assets`
- [ ] Create simple building models (boxes)
- [ ] Place buildings in scene
- [ ] Test navigation around compound

### Phase 2: Navigation Paths (2-3 hours)
**Goal**: Multiple routes visible

- [ ] Add cover objects (crates, barriers)
- [ ] Place vegetation along side path
- [ ] Mark fence breach points
- [ ] Add entrance/exit markers
- [ ] Test path variety

### Phase 3: Guard System (3-4 hours)
**Goal**: Patrols cover all paths

- [ ] Design patrol routes for 3-4 guards
- [ ] Stationary guard at checkpoint
- [ ] Roaming guards on perimeter
- [ ] Test coverage and gaps
- [ ] Tune patrol timing

### Phase 4: NPC Interaction (2-3 hours)
**Goal**: Talk to Informant

- [ ] Create NPC model (recolor guard)
- [ ] Place in maintenance shed
- [ ] Implement interaction trigger
- [ ] Create dialog UI
- [ ] Add minimap reveal effect

### Phase 5: Objectives (2-3 hours)
**Goal**: Primary + 2 optional objectives

- [ ] Add objective markers
- [ ] Create data terminal model/marker
- [ ] Implement "retrieve" action
- [ ] Add security codes objective
- [ ] Track detection status
- [ ] Display objectives in UI

### Phase 6: Polish (2-4 hours)
**Goal**: Feels like Liberty Island

- [ ] Lighting improvements
- [ ] Sound effects (footsteps, ambient)
- [ ] UI refinement
- [ ] Mission briefing screen
- [ ] Success/failure states
- [ ] Mini cutscene (optional)

**Total Estimate**: 15-20 hours over 2-3 weekends

## Building on Current System

### What We Keep
✅ Existing tile system (`level.map`, `level.assets`)  
✅ Guard AI with patrol routes  
✅ Player movement and camera  
✅ Minimap with tactical view  
✅ Debug panel for testing  

### What We Extend

**Level Structure**:
```javascript
state.level = {
  map: [...],           // Ground tiles (grass/pavement)
  assets: [...],        // Environmental objects
  buildings: [          // NEW: Building definitions
    {
      type: 'admin',
      position: [x, y, z],
      size: [w, h, stories],
      entrances: [...]
    }
  ],
  objectives: [         // NEW: Mission objectives
    {
      id: 'primary',
      type: 'retrieve',
      position: [x, y, z],
      completed: false
    }
  ],
  npcs: [               // NEW: Non-hostile NPCs
    {
      id: 'informant',
      position: [x, y, z],
      dialog: "...",
      interacted: false
    }
  ]
}
```

**Game State**:
```javascript
state.game = {
  guards: [...],        // Already have
  difficulty: 1,        // Already planned
  mission: {            // NEW: Mission tracking
    briefing: "...",
    primaryComplete: false,
    optionalComplete: [],
    alertLevel: 0,      // 0 = undetected, 1 = suspicious, 2 = alarm
    startTime: Date.now()
  }
}
```

## Vertical Slice Feature List

**For a complete MVP demo, include**:

✅ **World**
- 40x40 tile compound
- 3 buildings (exterior only)
- Perimeter fence
- Cover objects
- Multiple paths

✅ **Gameplay**
- Walk, crouch, sprint
- Interact with objects (E key)
- Retrieve objective
- Talk to NPC
- Detection system (guards spot player)

✅ **AI**
- 4 guards with patrol routes
- Detection cone (FOV)
- Alert state (chase player if spotted)
- Return to patrol after timeout

✅ **UI**
- Mission briefing screen
- Objective list
- Minimap with routes
- Interaction prompts
- Success/failure screens

✅ **Polish**
- Ambient sound
- Guard alert sounds
- UI feedback
- Smooth camera transitions

## Success Criteria

MVP is complete when:
1. ✅ Player can spawn and navigate compound
2. ✅ Multiple paths exist (direct, stealth, hybrid)
3. ✅ NPC can be talked to
4. ✅ Primary objective can be completed
5. ✅ At least 1 optional objective works
6. ✅ Guards patrol and can spot player
7. ✅ Mission can be won or lost
8. ✅ Feels like "baby Liberty Island"

## Playtesting Questions

After MVP is playable:
- Which path feels best?
- Are guards too easy/hard?
- Is stealth satisfying?
- Does NPC interaction feel natural?
- Are objectives clear?
- What's missing most?
- What should we add next?

## Next Steps After MVP

**Once MVP works, expand**:
1. **Building Interiors** - Enter buildings, multiple floors
2. **More Buildings** - Expand to 5-6 structures
3. **Vertical Gameplay** - Stairs, rooftops, vents
4. **More NPCs** - Multiple conversations, side quests
5. **Better AI** - Smarter guards, teamwork
6. **Procedural Generation** - Apply to this template
7. **Mission Variety** - Different objectives per playthrough

## My Recommendation

**Start This Week**:
1. Tonight: Find or create building assets (2-3 simple models)
2. Tomorrow: Expand grid and place buildings
3. Weekend: Implement NPC interaction + objectives

**By Next Week**: Have playable MVP that showcases the Liberty Island vision!

Want to start with asset hunting or should we code the building placement system first?


