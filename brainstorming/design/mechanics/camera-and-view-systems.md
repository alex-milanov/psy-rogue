# Camera & View Systems

**Inspirations**: GTA 3 camera switching, Syndicate isometric view

## Dynamic Camera System

### Current State
- 3rd person follow camera
- Mouse drag rotation (170-260° vertical constraint)
- Zoom with mouse wheel (12-60 units)

### Proposed Enhancement: Top-Down Mode

#### Trigger
- **Mouse drag down** beyond current limit triggers transition to top-down
- Alternative: Keyboard shortcut (V key, like GTA?)
- Smooth lerp transition over ~0.5s

#### Implementation Ideas
```javascript
// In camera service
cameraMode: 'third-person' | 'top-down' | 'tactical'

// Angle thresholds
if (cameraAngle.y < 170) {
  // Transition to top-down
  targetAngle.y = 90  // Pure top-down
  targetDistance = 80 // Pull back further
}
```

#### Top-Down Benefits
- **Tactical overview** - See patrol routes, plan approach
- **Stealth planning** - Better view of guard positions
- **Syndicate feel** - Isometric-ish commanding view
- **Classic GTA nostalgia** - Optional old-school gameplay

### View Modes

1. **Third Person** (current)
   - Close to character
   - Action-oriented
   - Good for combat/movement

2. **Top-Down / Tactical**
   - 60-80° angle from above
   - Wider FOV or pull back camera
   - See more of level
   - Plan routes and timing

3. **Isometric** (Syndicate-inspired)
   - Fixed ~45° angle
   - No rotation, just pan with character
   - Could be a third mode or variant of top-down

## Technical Considerations

### Camera State
```javascript
camera: {
  mode: 'third-person', // 'top-down', 'isometric'
  distance: 60,
  angle: { x, y },
  fov: 45, // Adjust FOV based on mode
  followPlayer: true
}
```

### Transition Smoothing
- Use `lerp` for smooth angle/distance changes
- Ease-in-out for professional feel
- ~500ms transition feels responsive but not jarring

### UI Indicators
- Small icon showing current camera mode
- Tutorial hint: "Drag down to switch to tactical view"

