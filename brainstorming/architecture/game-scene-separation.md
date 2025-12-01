# Game/Scene Separation Architecture

*Date: 2025-11-30*

## Overview

Implemented a clean separation between game logic (mechanics), control (input), and scene (visualization), inspired by the `virux` prototype architecture.

## Architecture Pattern

### Control Service (`services/control/`)
- **Responsibility**: Input handling and state calculations
- **Manages**: Keyboard, mouse, gamepad input
- **Calculates**: Player movement, rotation, camera angles
- **Updates**: `state.player.*`, `state.camera.angle`
- **Never touches**: Three.js objects or game mechanics

### Game Service (`services/game/`)
- **Responsibility**: Pure game logic and state management
- **Manages**: Guard AI, positions, rotations, patrol routes, game modes
- **Updates**: `state.game.*`
- **Never touches**: Three.js objects or 3D rendering

### Scene Service (`services/scene/`)
- **Responsibility**: 3D visualization only
- **Reads from**: `state.player.*`, `state.camera.*`, `state.game.*`
- **Manages**: Three.js meshes, materials, animations, camera positioning
- **Syncs**: 3D model positions/rotations to game state
- **Never modifies**: Game logic or calculates input

## Benefits

1. **Clear Separation of Concerns**
   - Game logic independent of rendering
   - Can test/modify AI without touching 3D code
   - Can swap renderers without changing game logic

2. **State Flow**
   ```
   User Input → Control Service → state.player.*, state.camera.angle
                                             ↓
   Game Loop → Game Service → state.game.*  ↓
                                   ↓        ↓
                                   ↓  Scene Service → 3D Visualization
                                   ↓        ↓
                                   ↘ Minimap Service → 2D Visualization
   ```

3. **Simplified Services**
   - Minimap reads from `state.game.guards` (not scene state)
   - UI components read from single source of truth
   - No duplicate state management

## Implementation Examples

### Camera Angle Calculation

**Before (Mixed in Scene)**
```javascript
// services/scene/camera.js - mixing input handling with rendering
let cameraAngle = {x: 45, y: 210};
const refresh = ({camera, state}) => {
  if (state.viewport.mouse.down) {
    cameraAngle.y = (state.camera.range.h + cameraAngle.y - mouse.y) % state.camera.range.h;
  }
  camera.position.copy(calculatePosition(cameraAngle)); // Rendering
};
```

**After (Separated)**
```javascript
// services/control/camera.js - pure input calculation
const hook = ({state$, actions}) => {
  time.frame().pipe(
    withLatestFrom(state$),
    filter(state => state.viewport.mouse.down)
  ).subscribe(state => {
    cameraAngle.y = (state.camera.range.h + cameraAngle.y - mouse.y) % state.camera.range.h;
    actions.set(['camera', 'angle'], cameraAngle); // Update state
  });
};

// services/scene/camera.js - pure visualization
const refresh = ({camera, state}) => {
  const cameraAngle = state.camera.angle; // Read from state
  camera.position.copy(calculatePosition(cameraAngle)); // Position camera
};
```

### Guard AI & Rendering

**Before (Mixed Logic)**
```javascript
// Scene service managing both logic and rendering
guards.forEach(guard => {
  if (guard.model.mode === 'walk') {
    guard.model.position.add(direction); // Logic
    guard.acts[1].setEffectiveWeight(1); // Rendering
  }
});
```

**After (Separated)**
```javascript
// Game service - pure logic
const updateGuard = (guard) => {
  if (guard.mode === 'walk') {
    guard.position[0] += dx * ratio;
    guard.rotation = Math.atan2(dx, dz);
  }
  return guard;
};

// Scene service - pure visualization
guards.forEach(guard => {
  const gameGuard = state.game.guards.find(g => g.id === guard.model.guardId);
  guard.model.position.copy(new THREE.Vector3().fromArray(gameGuard.position));
  guard.model.rotation.y = gameGuard.rotation;
});
```

## Current Game State Structure

```javascript
state.game = {
  guards: [
    {
      id: 'guard-1',
      position: [x, y, z],
      rotation: radians,
      route: [[x1,y1,z1], [x2,y2,z2]],
      routeIndex: 0,
      mode: 'idle' | 'walk',
      frame: 0
    }
  ]
}
```

## Minimap Integration

The minimap now correctly visualizes game state:
- **Player position & rotation** from `state.player`
- **Camera angle & FOV** from `state.camera.angle`
- **Guard positions & rotations** from `state.game.guards`
- **Viewport mode indicator** (top-down/elevated/3rd person)

## Next Steps

Future game mechanics to add to `services/game/`:
- Alert system (guard detection ranges)
- Objective tracking
- Persuasion mechanics
- Agent augmentation system
- Mission state management

