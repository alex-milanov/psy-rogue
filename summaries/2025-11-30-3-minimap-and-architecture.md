# Minimap Implementation & Game/Scene Architecture Separation

*Date: 2025-11-30*  
*Session: 3*

## Overview

Implemented a tactical minimap with real-time enemy tracking and completed the game/scene/control architecture separation inspired by the `virux` prototype.

## Major Features Implemented

### 1. Tactical Minimap

**Location**: Top-right corner, toggle with `M` key

**Visual Elements**:
- **Player Indicator**: Blue dot with glow, blue arrow showing facing direction
- **Guard Indicators**: Red dots with glow, red arrows showing facing direction (updated in real-time)
- **Camera FOV Visualization**: 
  - 3rd person view: 70° directional cone/wedge
  - Elevated view: Expanding cone
  - Top-down view: Full 360° circle
  - Smooth transition using 3D cone projection math
- **View Mode Indicator**: Text label showing current camera mode (TOP-DOWN/ELEVATED/3RD PERSON)
- **Grid Lines**: Subtle blue grid for spatial reference

**Technical Implementation**:
- Hybrid approach: Snabbdom for UI container + Canvas 2D for real-time rendering
- Player direction updates based on movement (W/A/S/D adjusts facing)
- Camera FOV shape morphs based on vertical camera angle (cone projection)
- Coordinate system corrections (-45° offset for proper alignment)

### 2. Game/Scene/Control Architecture Separation

Completed a clean 3-tier architecture pattern:

#### Control Service (`services/control/`)
- **Responsibility**: Input handling and state calculations
- **Manages**: Keyboard, mouse input
- **Calculates**: Player movement, camera angles
- **Updates**: `state.player.*`, `state.camera.angle`
- **Sub-services**: `control/camera.js` for camera angle tracking

#### Game Service (`services/game/`)
- **Responsibility**: Pure game logic and mechanics
- **Manages**: Guard AI, patrol routes, idle/walk states
- **Updates**: `state.game.guards` every frame
- **Never touches**: Three.js objects or rendering

#### Scene Service (`services/scene/`)
- **Responsibility**: 3D visualization only
- **Reads from**: `state.player.*`, `state.camera.*`, `state.game.*`
- **Manages**: Three.js meshes, materials, animations, camera positioning
- **Syncs**: 3D model positions/rotations from game state
- **Never modifies**: Game logic or input state

### 3. Guard AI System

**Game State Structure**:
```javascript
state.game.guards = [
  {
    id: 'guard-1',
    position: [x, y, z],
    rotation: radians,
    route: [[x1,y1,z1], [x2,y2,z2], ...],
    routeIndex: 0,
    mode: 'idle' | 'walk',
    frame: 0
  }
]
```

**Behavior**:
- Guards follow predefined patrol routes
- Idle for 60 frames at each waypoint
- Walk between waypoints at constant speed
- Reverse route when reaching the end
- Scene service reads guard data and syncs 3D models
- Minimap service reads guard data and displays positions

### 4. Debug Enhancements

**Added to Controls Panel**:
- Player position `[x, y, z]` with 1 decimal precision
- Player rotation in degrees
- Player direction vector `[left/right, up/down, front/back]`
- Camera angles `[horizontal, vertical]`
- Movement force percentage
- Crouch status

## Architecture Benefits

1. **Single Source of Truth**: State flows in one direction
   ```
   User Input → Control → state.*
   Game Loop → Game → state.game.*
                  ↓
   Scene/Minimap read state → Render
   ```

2. **Clear Separation of Concerns**:
   - Game logic independent of rendering
   - Can test/modify AI without touching 3D code
   - Can swap renderers without changing game logic

3. **Simplified Services**:
   - Minimap reads from `state.game.guards` (not scene state)
   - UI components read from single source
   - No duplicate state management

## Technical Challenges Solved

### 1. Player Rotation Display
**Problem**: Player visual rotation in 3D (via `character.lookAt()`) wasn't reflected in `state.player.rotation`

**Solution**: Minimap now calculates facing from `state.player.direction` vector combined with base rotation, accurately showing which way the character faces when moving left/right/back.

### 2. Camera FOV Visualization
**Problem**: How to represent a 3D camera cone on a 2D top-down minimap?

**Solution**: Implemented 3D cone projection math:
- Top-down view: Circle (cone viewed from above)
- 3rd person: Wedge (cone viewed from side)
- Transition: Smooth FOV expansion from 70° to 360° with wedge closure

**Formula**: `topDownness = (cameraY - 190) / 60` interpolates between views

### 3. Coordinate System Alignment
**Problem**: Minimap arrows were 45° offset from actual facing

**Solution**: Applied -45° correction when converting from game coordinates to minimap canvas coordinates

### 4. Guard State Synchronization
**Problem**: Guards were managed in scene with mixed logic/rendering

**Solution**: 
- Game service manages guard positions/rotations
- Scene service creates 3 guard models, matches them by ID to game state
- Minimap reads directly from `state.game.guards`

## Files Modified

### New Files
- `src/js/services/game/index.js` - Guard AI and game loop
- `src/js/services/control/camera.js` - Camera angle calculation
- `src/js/ui/minimap/index.js` - Minimap UI container
- `src/js/services/minimap/index.js` - Minimap canvas rendering
- `brainstorming/game-scene-separation.md` - Architecture documentation

### Modified Files
- `src/js/index.js` - Added game service hook
- `src/js/actions/index.js` - Added `minimap` and `game` initial state, updated camera with angle
- `src/js/services/scene/index.js` - Removed scene state sharing with minimap
- `src/js/services/scene/npcs.js` - Refactored to read from `state.game.guards`
- `src/js/services/scene/camera.js` - Simplified to pure visualization (reads `state.camera.angle`)
- `src/js/services/control/index.js` - Added camera control sub-service hook
- `src/js/ui/index.js` - Added minimap component
- `src/js/ui/controls/index.js` - Added player debug info

## Player Controls

- **WASD**: Move (player faces movement direction)
- **Mouse Drag**: Rotate camera horizontally + vertically
- **Shift**: Walk slowly
- **C**: Crouch
- **M**: Toggle minimap
- **Scroll**: Zoom camera

## Camera Behavior

- **Horizontal drag**: Rotates camera around player (updates `player.rotation`)
- **Vertical drag**: Changes camera elevation (top-down ↔ 3rd person)
- **Player faces**: Where camera is looking (horizontally)
- **Movement**: Always relative to camera direction (W = forward, A = left, etc.)

## Next Steps (Potential)

1. **Alert System**: Add detection ranges for guards, change minimap indicators when spotted
2. **Objectives**: Display mission objectives on minimap
3. **Patrol Routes**: Visual patrol path indicators
4. **Procedural Generation**: Implement compound generation system
5. **Persuasion Mechanics**: Add Syndicate-style agent augmentation
6. **Three.js Upgrade**: Migrate from r100 to r169+ (deferred for now)

## Performance Notes

- Minimap renders every frame (with `time.frame()`)
- Guard AI updates every frame
- Scene syncs 3D models every other frame (`filter((dt, i) => i % 2 === 0)`)
- No performance issues observed with current setup (3 guards, 200x200px minimap)

## Lessons Learned

1. **Don't fix what's working**: Initial attempts to "improve" player rotation broke existing functionality. The scene's `character.lookAt()` was already working correctly.

2. **Understand before changing**: Spent time understanding the existing control flow (camera rotation → player.rotation → movement) before making architectural changes.

3. **Coordinate systems matter**: The -45° offset was crucial for correct minimap visualization due to how the 3D scene coordinates map to 2D canvas.

4. **State is king**: Once game state was clean and separated, both 3D rendering and minimap visualization became straightforward.

5. **Smooth transitions**: For camera FOV, calculating `topDownness` as a continuous value (0-1) enabled smooth morphing instead of abrupt mode switches.

